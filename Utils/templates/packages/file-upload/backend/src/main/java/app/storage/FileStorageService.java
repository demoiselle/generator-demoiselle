package <%= package.lower %>.<%= project.lower %>.storage;

import jakarta.annotation.PostConstruct;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;
import java.util.logging.Level;
import java.util.logging.Logger;

import org.eclipse.microprofile.config.inject.ConfigProperty;

@ApplicationScoped
public class FileStorageService {

    private static final Logger LOG = Logger.getLogger(FileStorageService.class.getName());

    @Inject
    @ConfigProperty(name = "app.file.storage.directory", defaultValue = "uploads")
    private String storageDirectory;

    private Path storagePath;

    @PostConstruct
    public void init() {
        storagePath = Paths.get(storageDirectory).toAbsolutePath().normalize();
        try {
            Files.createDirectories(storagePath);
        } catch (IOException e) {
            LOG.log(Level.SEVERE, "Could not create storage directory: " + storagePath, e);
            throw new RuntimeException("Could not create storage directory", e);
        }
    }

    public String store(InputStream inputStream, String originalName) throws IOException {
        String storedName = UUID.randomUUID().toString() + getExtension(originalName);
        Path targetPath = storagePath.resolve(storedName).normalize();

        if (!targetPath.startsWith(storagePath)) {
            throw new IOException("Cannot store file outside storage directory");
        }

        Files.copy(inputStream, targetPath, StandardCopyOption.REPLACE_EXISTING);
        LOG.log(Level.INFO, "Stored file: {0} as {1}", new Object[]{originalName, storedName});
        return storedName;
    }

    public Path load(String storedName) throws IOException {
        Path filePath = storagePath.resolve(storedName).normalize();

        if (!filePath.startsWith(storagePath)) {
            throw new IOException("Cannot access file outside storage directory");
        }

        if (!Files.exists(filePath)) {
            throw new IOException("File not found: " + storedName);
        }

        return filePath;
    }

    public void delete(String storedName) throws IOException {
        Path filePath = storagePath.resolve(storedName).normalize();

        if (!filePath.startsWith(storagePath)) {
            throw new IOException("Cannot delete file outside storage directory");
        }

        Files.deleteIfExists(filePath);
        LOG.log(Level.INFO, "Deleted file: {0}", storedName);
    }

    private String getExtension(String fileName) {
        if (fileName == null) {
            return "";
        }
        int dotIndex = fileName.lastIndexOf('.');
        if (dotIndex >= 0) {
            return fileName.substring(dotIndex);
        }
        return "";
    }
}
