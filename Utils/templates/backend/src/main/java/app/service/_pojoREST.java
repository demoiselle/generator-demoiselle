package <%= package.lower %>.<%= project.lower %>.service;

import <%= package.lower %>.<%= project.lower %>.bc.<%= name.capital %>BC;
import <%= package.lower %>.<%= project.lower %>.entity.<%= name.capital %>;
import java.io.ByteArrayOutputStream;
import java.io.StringWriter;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import jakarta.annotation.security.RolesAllowed;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.eclipse.microprofile.openapi.annotations.Operation;
import org.eclipse.microprofile.openapi.annotations.parameters.Parameter;
import org.eclipse.microprofile.openapi.annotations.enums.ParameterIn;
import org.eclipse.microprofile.openapi.annotations.enums.SecuritySchemeType;
import org.eclipse.microprofile.openapi.annotations.security.SecurityRequirement;
import org.eclipse.microprofile.openapi.annotations.security.SecurityScheme;
import org.eclipse.microprofile.openapi.annotations.tags.Tag;
import org.demoiselle.jee.core.api.crud.Result;
import org.demoiselle.jee.crud.AbstractREST;
import org.demoiselle.jee.crud.Search;

@Tag(name = "v1/<%= name.capital %>s")
@SecurityScheme(securitySchemeName = "jwt", type = SecuritySchemeType.HTTP, scheme = "bearer", bearerFormat = "JWT")
@SecurityRequirement(name = "jwt")
@Path("v1/<%= name.lower %>s")
@RolesAllowed({"ADMIN", "USER"})
public class <%= name.capital %>REST extends AbstractREST< <%= name.capital %>, UUID> {

    @Inject
    private <%= name.capital %>BC bc;

    @GET
    @Override
    @Transactional
    @Search(fields = {"*"}) // Escolha quais campos vão para o frontend Ex: {"id", "description"}
    @Operation(summary = "Lista <%= name.capital %>s", description = "Retorna lista paginada de <%= name.capital %>s")
    public Result find() {
        return bc.find();
    }

    @GET
    @Path("export")
    @Produces("text/csv")
    @Transactional
    @Operation(summary = "Exportar <%= name.capital %>s em CSV", description = "Exporta dados filtrados de <%= name.capital %>s em formato CSV")
    public Response exportCsv() {
        Result result = bc.find();
        StringWriter writer = new StringWriter();
        @SuppressWarnings("unchecked")
        List<<%= name.capital %>> items = (List<<%= name.capital %>>) result.getContent();
        // Header CSV
        writer.append("<%= (properties || []).filter(function(p) { return !p.isReadOnly; }).map(function(p) { return p.name; }).join(',') %>");
        writer.append("\n");
        if (items != null) {
            for (<%= name.capital %> item : items) {
                writer.append(item.toString());
                writer.append("\n");
            }
        }
        return Response.ok(writer.toString())
                .header("Content-Disposition", "attachment; filename=\"<%= name.lower %>s.csv\"")
                .build();
    }

    @GET
    @Path("export/pdf")
    @Produces("application/pdf")
    @Transactional
    @Operation(summary = "Exportar <%= name.capital %>s em PDF", description = "Exporta dados filtrados de <%= name.capital %>s em formato PDF")
    public Response exportPdf() {
        Result result = bc.find();
        @SuppressWarnings("unchecked")
        List<<%= name.capital %>> items = (List<<%= name.capital %>>) result.getContent();
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        com.lowagie.text.Document document = new com.lowagie.text.Document();
        try {
            com.lowagie.text.pdf.PdfWriter.getInstance(document, baos);
            document.open();
            document.add(new com.lowagie.text.Paragraph("<%= name.capital %>s"));
            document.add(new com.lowagie.text.Paragraph(" "));
            if (items != null) {
                for (<%= name.capital %> item : items) {
                    document.add(new com.lowagie.text.Paragraph(item.toString()));
                }
            }
            document.close();
        } catch (com.lowagie.text.DocumentException e) {
            throw new RuntimeException("Erro ao gerar PDF", e);
        }
        return Response.ok(baos.toByteArray())
                .header("Content-Disposition", "attachment; filename=\"<%= name.lower %>s.pdf\"")
                .build();
    }

}
