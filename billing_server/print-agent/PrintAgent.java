import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpServer;

import javax.print.PrintService;
import javax.print.PrintServiceLookup;
import java.io.IOException;
import java.io.OutputStream;
import java.net.InetSocketAddress;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Base64;

/**
 * Runs on the shop PC, next to the thermal printer.
 * The cloud site sends the receipt here, and this prints it by the
 * printer name saved in Company Details.
 */
public class PrintAgent {
    public static void main(String[] args) throws Exception {
        HttpServer server = HttpServer.create(new InetSocketAddress("127.0.0.1", 9177), 0);
        server.createContext("/print", PrintAgent::handle);
        server.start();
        System.out.println("Print agent ready at http://127.0.0.1:9177");
        System.out.println("Leave this window open while billing.");
    }

    private static void handle(HttpExchange exchange) throws IOException {
        cors(exchange);
        if ("OPTIONS".equalsIgnoreCase(exchange.getRequestMethod())) {
            exchange.sendResponseHeaders(204, -1);
            exchange.close();
            return;
        }
        if (!"POST".equalsIgnoreCase(exchange.getRequestMethod())) {
            send(exchange, 405, "{\"ok\":false,\"error\":\"POST only\"}");
            return;
        }
        String body = new String(exchange.getRequestBody().readAllBytes(), StandardCharsets.UTF_8);
        String printerName = jsonString(body, "printerName");
        String payload = jsonString(body, "payload");
        if (printerName.isBlank() || payload.isBlank()) {
            send(exchange, 400, "{\"ok\":false,\"error\":\"Printer name or receipt is missing\"}");
            return;
        }
        try {
            byte[] data = Base64.getDecoder().decode(payload);
            if (!sendRaw(printerName, data)) {
                send(exchange, 404, "{\"ok\":false,\"error\":\"Printer not found on this PC: " + escape(printerName) + "\"}");
                return;
            }
            send(exchange, 200, "{\"ok\":true}");
        } catch (Exception ex) {
            String message = ex.getMessage() == null ? "Print failed" : ex.getMessage();
            send(exchange, 500, "{\"ok\":false,\"error\":\"" + escape(message) + "\"}");
        }
    }

    private static boolean sendRaw(String printerName, byte[] data) throws IOException, InterruptedException {
        String exact = resolvePrinter(printerName);
        Path receipt = Files.createTempFile("receipt-", ".bin");
        Path script = Path.of("RawPrint.ps1");
        if (!Files.exists(script)) {
            script = Path.of(System.getProperty("user.dir"), "RawPrint.ps1");
        }
        if (!Files.exists(script)) {
            throw new IOException("RawPrint.ps1 is missing next to the print agent");
        }
        try {
            Files.write(receipt, data);
            Process process = new ProcessBuilder(
                    "powershell",
                    "-NoProfile",
                    "-ExecutionPolicy", "Bypass",
                    "-File", script.toAbsolutePath().toString(),
                    "-Printer", exact,
                    "-Path", receipt.toAbsolutePath().toString()
            ).redirectErrorStream(true).start();
            String output = new String(process.getInputStream().readAllBytes(), StandardCharsets.UTF_8).trim();
            int code = process.waitFor();
            if (code != 0 || !output.contains("ok")) {
                throw new IOException(output.isBlank() ? "Could not send raw data to " + exact : output);
            }
            return true;
        } finally {
            Files.deleteIfExists(receipt);
        }
    }

    private static String resolvePrinter(String printerName) {
        String wanted = printerName.toLowerCase();
        for (PrintService service : PrintServiceLookup.lookupPrintServices(null, null)) {
            if (service.getName().toLowerCase().contains(wanted)) {
                return service.getName();
            }
        }
        return printerName;
    }

    private static void cors(HttpExchange exchange) {
        exchange.getResponseHeaders().set("Access-Control-Allow-Origin", "*");
        exchange.getResponseHeaders().set("Access-Control-Allow-Methods", "POST, OPTIONS");
        exchange.getResponseHeaders().set("Access-Control-Allow-Headers", "Content-Type");
        exchange.getResponseHeaders().set("Access-Control-Allow-Private-Network", "true");
    }

    private static void send(HttpExchange exchange, int status, String json) throws IOException {
        byte[] bytes = json.getBytes(StandardCharsets.UTF_8);
        exchange.getResponseHeaders().set("Content-Type", "application/json");
        exchange.sendResponseHeaders(status, bytes.length);
        try (OutputStream out = exchange.getResponseBody()) {
            out.write(bytes);
        }
    }

    private static String jsonString(String json, String key) {
        String mark = "\"" + key + "\"";
        int keyAt = json.indexOf(mark);
        if (keyAt < 0) {
            return "";
        }
        int colon = json.indexOf(':', keyAt + mark.length());
        int start = json.indexOf('"', colon + 1);
        if (start < 0) {
            return "";
        }
        int end = json.indexOf('"', start + 1);
        if (end < 0) {
            return "";
        }
        return json.substring(start + 1, end);
    }

    private static String escape(String value) {
        return value.replace("\\", "\\\\").replace("\"", "\\\"");
    }
}
