package <%= package.lower %>.<%= project.lower %>.export;

import com.lowagie.text.Document;
import com.lowagie.text.DocumentException;
import com.lowagie.text.Element;
import com.lowagie.text.Font;
import com.lowagie.text.FontFactory;
import com.lowagie.text.PageSize;
import com.lowagie.text.Paragraph;
import com.lowagie.text.Phrase;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;

import jakarta.enterprise.context.ApplicationScoped;

import java.io.ByteArrayOutputStream;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.logging.Level;
import java.util.logging.Logger;

@ApplicationScoped
public class PdfExporter {

    private static final Logger LOG = Logger.getLogger(PdfExporter.class.getName());

    private static final Font TITLE_FONT = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 16);
    private static final Font HEADER_FONT = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10);
    private static final Font CELL_FONT = FontFactory.getFont(FontFactory.HELVETICA, 9);

    /**
     * Generates a PDF document from a list of data maps.
     *
     * @param title the document title
     * @param data  list of maps where each map represents a row (column name → value)
     * @return PDF content as a byte array
     */
    public byte[] export(String title, List<Map<String, Object>> data) {
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        Document document = new Document(PageSize.A4.rotate());

        try {
            PdfWriter.getInstance(document, baos);
            document.open();

            // Title
            Paragraph titleParagraph = new Paragraph(title, TITLE_FONT);
            titleParagraph.setAlignment(Element.ALIGN_CENTER);
            titleParagraph.setSpacingAfter(12f);
            document.add(titleParagraph);

            if (data == null || data.isEmpty()) {
                document.add(new Paragraph("No data available.", CELL_FONT));
                document.close();
                return baos.toByteArray();
            }

            // Collect all column names preserving insertion order
            Set<String> columns = new LinkedHashSet<>();
            for (Map<String, Object> row : data) {
                columns.addAll(row.keySet());
            }

            // Create table
            PdfPTable table = new PdfPTable(columns.size());
            table.setWidthPercentage(100);
            table.setSpacingBefore(10f);

            // Header row
            for (String column : columns) {
                PdfPCell cell = new PdfPCell(new Phrase(column, HEADER_FONT));
                cell.setHorizontalAlignment(Element.ALIGN_CENTER);
                cell.setPadding(5f);
                table.addCell(cell);
            }

            // Data rows
            for (Map<String, Object> row : data) {
                for (String column : columns) {
                    Object value = row.get(column);
                    PdfPCell cell = new PdfPCell(new Phrase(
                            value != null ? value.toString() : "", CELL_FONT));
                    cell.setPadding(4f);
                    table.addCell(cell);
                }
            }

            document.add(table);
            document.close();
        } catch (DocumentException e) {
            LOG.log(Level.SEVERE, "Error generating PDF", e);
            throw new RuntimeException("Error generating PDF", e);
        }

        return baos.toByteArray();
    }
}
