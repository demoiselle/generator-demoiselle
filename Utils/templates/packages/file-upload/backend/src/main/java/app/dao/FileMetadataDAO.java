package <%= package.lower %>.<%= project.lower %>.dao;

import <%= package.lower %>.<%= project.lower %>.entity.FileMetadata;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;

import java.util.logging.Logger;

import org.demoiselle.jee.crud.AbstractDAO;

public class FileMetadataDAO extends AbstractDAO<FileMetadata, Long> {

    private static final Logger LOG = Logger.getLogger(FileMetadataDAO.class.getName());

    @PersistenceContext(unitName = "<%= project.lower %>PU")
    protected EntityManager em;

    @Override
    protected EntityManager getEntityManager() {
        return em;
    }
}
