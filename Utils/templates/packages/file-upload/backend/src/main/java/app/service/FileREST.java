package <%= package.lower %>.<%= project.lower %>.service;

import <%= package.lower %>.<%= project.lower %>.dao.FileMetadataDAO;
import <%= package.lower %>.<%= project.lower %>.entity.FileMetadata;
import <%= package.lower %>.<%= project.lower %>.storage.FileStorageService;

import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.DELETE;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.Produces;
import static jakarta.ws.rs.core.MediaType.APPLICATION_JSON;
import static jakarta.ws.rs.core.MediaType.MULTIPART_FORM_DATA;
import jakarta.ws.rs.core.Response;
import static jakarta.ws.rs.core.Response.ok;
import static jakarta.ws.rs.core.Response.status;

import java.io.IOException;
import java.io.InputStream;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.logging.Level;
import java.util.logging.Logger;

import org.eclipse.microprofile.config.inject.ConfigProperty;
import org.eclipse.microprofile.openapi.annotations.Operation;
import org.eclipse.microprofile.openapi.annotations.tags.Tag;

import org.jboss.resteasy.plugins.providers.multipart.InputPart;
import org.jboss.resteasy.plugins.providers.multipart.MultipartFormDataInput;

import org.demoiselle.jee.security.annotation.Authenticated;
import org.demoiselle.jee.security.annotation.RequiredAnyRole;
import org.demoiselle.jee.security.annotation.RateLimit;
import org.demoiselle.jee.observability.annotation.Counted;

@Tag(name = "Files")
@Path("files")
@Produces(APPLICATION_JSON)
@Authenticated
@RequiredAnyRole({"ADMIN", "USER"})
@Counted
public class FileREST {

    private static final Logger LOG = Logger.getLogger(FileREST.class.getName());

    @Inject
    private FileMetadataDAO fileMetadataDAO;

    @Inject
    private FileStorageService fileStorageService;

    @Inject
    @ConfigProperty(name = "app.file.max-size", defaultValue = "10485760")
    private Long maxFileSize;

    @Inject
    @ConfigProperty(name = "app.file.allowed-mime-types",
            defaultValue = "image/png,image/jpeg,image/gif,application/pdf,text/plain")
    private String allowedMimeTypes;

    @POST
    @Path("upload")
    @Consumes(MULTIPART_FORM_DATA)
    @Transactional
    @RateLimit(requests = 30, window = 60)
    @Operation(summary = "Upload a file")
    public Response upload(MultipartFormDataInput input) {
        try {
            List<InputPart> parts = input.getFormDataMap().get("file");
            if (parts == null || parts.isEmpty()) {
                return status(Response.Status.BAD_REQUEST)
                        .entity("{\"error\":\"No file provided\"}")
                        .build();
            }

            InputPart filePart = parts.get(0);
            String fileName = extractFileName(filePart);
            String mimeType = filePart.getMediaType().toString();
            InputStream fileStream = filePart.getBody(InputStream.class, null);

            // Validate MIME type
            List<String> allowed = Arrays.asList(allowedMimeTypes.split(","));
            if (!allowed.contains(mimeType)) {
                return status(Response.Status.UNSUPPORTED_MEDIA_TYPE)
                        .entity("{\"error\":\"File type not allowed: " + mimeType + "\"}")
                        .build();
            }

            // Store the file
            String storedName = fileStorageService.store(fileStream, fileName);

            // Determine file size from stored file
            java.nio.file.Path storedPath = fileStorageService.load(storedName);
            long fileSize = java.nio.file.Files.size(storedPath);

            // Validate file size
            if (fileSize > maxFileSize) {
                fileStorageService.delete(storedName);
                return status(Response.Status.REQUEST_ENTITY_TOO_LARGE)
                        .entity("{\"error\":\"File size exceeds maximum allowed: " + maxFileSize + " bytes\"}")
                        .build();
            }

            // Save metadata
            FileMetadata metadata = new FileMetadata();
            metadata.setOriginalName(fileName);
            metadata.setStoredName(storedName);
            metadata.setMimeType(mimeType);
            metadata.setSize(fileSize);
            metadata.setUploadedAt(LocalDateTime.now());

            fileMetadataDAO.persist(metadata);

            return status(Response.Status.CREATED).entity(metadata).build();

        } catch (IOException e) {
            LOG.log(Level.SEVERE, "File upload failed", e);
            return status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity("{\"error\":\"File upload failed\"}")
                    .build();
        }
    }

    @GET
    @Path("{id}")
    @Operation(summary = "Download a file by ID")
    public Response download(@PathParam("id") Long id) {
        FileMetadata metadata = fileMetadataDAO.find(id);

        if (metadata == null) {
            return status(Response.Status.NOT_FOUND)
                    .entity("{\"error\":\"File not found\"}")
                    .build();
        }

        try {
            java.nio.file.Path filePath = fileStorageService.load(metadata.getStoredName());
            return ok(filePath.toFile())
                    .header("Content-Disposition", "attachment; filename=\"" + metadata.getOriginalName() + "\"")
                    .header("Content-Type", metadata.getMimeType())
                    .build();
        } catch (IOException e) {
            LOG.log(Level.SEVERE, "File download failed for id: " + id, e);
            return status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity("{\"error\":\"File download failed\"}")
                    .build();
        }
    }

    @DELETE
    @Path("{id}")
    @Transactional
    @Operation(summary = "Delete a file by ID")
    public Response delete(@PathParam("id") Long id) {
        FileMetadata metadata = fileMetadataDAO.find(id);

        if (metadata == null) {
            return status(Response.Status.NOT_FOUND)
                    .entity("{\"error\":\"File not found\"}")
                    .build();
        }

        try {
            fileStorageService.delete(metadata.getStoredName());
            fileMetadataDAO.remove(id);
            return ok().entity("{\"message\":\"File deleted successfully\"}").build();
        } catch (IOException e) {
            LOG.log(Level.SEVERE, "File deletion failed for id: " + id, e);
            return status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity("{\"error\":\"File deletion failed\"}")
                    .build();
        }
    }

    private String extractFileName(InputPart inputPart) {
        String[] contentDisposition = inputPart.getHeaders()
                .getFirst("Content-Disposition").split(";");
        for (String part : contentDisposition) {
            if (part.trim().startsWith("filename")) {
                return part.split("=")[1].trim().replaceAll("\"", "");
            }
        }
        return "unknown";
    }
}
