package <%= package.lower %>.<%= project.lower %>.export;

import com.opencsv.CSVWriter;

import jakarta.enterprise.context.ApplicationScoped;

import java.io.IOException;
import java.io.StringWriter;
import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.logging.Level;
import java.util.logging.Logger;

@ApplicationScoped
public class CsvExporter {

    private static final Logger LOG = Logger.getLogger(CsvExporter.class.getName());

    /**
     * Generates a CSV string from a list of data maps.
     * The header row is derived from the keys of the first map entry.
     *
     * @param data list of maps where each map represents a row (column name → value)
     * @return CSV content as a String
     */
    public String export(List<Map<String, Object>> data) {
        if (data == null || data.isEmpty()) {
            return "";
        }

        StringWriter stringWriter = new StringWriter();

        try (CSVWriter csvWriter = new CSVWriter(stringWriter)) {
            // Collect all column names preserving insertion order
            Set<String> columns = new LinkedHashSet<>();
            for (Map<String, Object> row : data) {
                columns.addAll(row.keySet());
            }

            // Write header
            csvWriter.writeNext(columns.toArray(new String[0]));

            // Write data rows
            for (Map<String, Object> row : data) {
                List<String> values = new ArrayList<>();
                for (String column : columns) {
                    Object value = row.get(column);
                    values.add(value != null ? value.toString() : "");
                }
                csvWriter.writeNext(values.toArray(new String[0]));
            }
        } catch (IOException e) {
            LOG.log(Level.SEVERE, "Error generating CSV", e);
            throw new RuntimeException("Error generating CSV", e);
        }

        return stringWriter.toString();
    }
}
