param(
    [Parameter(Mandatory = $true)][string]$Printer,
    [Parameter(Mandatory = $true)][string]$Path
)

Add-Type -TypeDefinition @"
using System;
using System.IO;
using System.Runtime.InteropServices;
public class ReceiptRaw {
    [StructLayout(LayoutKind.Sequential, CharSet = CharSet.Ansi)]
    public class DocInfo {
        [MarshalAs(UnmanagedType.LPStr)] public string pDocName;
        [MarshalAs(UnmanagedType.LPStr)] public string pOutputFile;
        [MarshalAs(UnmanagedType.LPStr)] public string pDataType;
    }
    [DllImport("winspool.drv", EntryPoint = "OpenPrinterA", SetLastError = true, CharSet = CharSet.Ansi)]
    public static extern bool OpenPrinter(string name, out IntPtr handle, IntPtr defaults);
    [DllImport("winspool.drv", SetLastError = true)]
    public static extern bool ClosePrinter(IntPtr handle);
    [DllImport("winspool.drv", EntryPoint = "StartDocPrinterA", SetLastError = true, CharSet = CharSet.Ansi)]
    public static extern bool StartDocPrinter(IntPtr handle, int level, [In, MarshalAs(UnmanagedType.LPStruct)] DocInfo doc);
    [DllImport("winspool.drv", SetLastError = true)]
    public static extern bool EndDocPrinter(IntPtr handle);
    [DllImport("winspool.drv", SetLastError = true)]
    public static extern bool StartPagePrinter(IntPtr handle);
    [DllImport("winspool.drv", SetLastError = true)]
    public static extern bool EndPagePrinter(IntPtr handle);
    [DllImport("winspool.drv", SetLastError = true)]
    public static extern bool WritePrinter(IntPtr handle, byte[] bytes, int count, out int written);
    public static string Send(string printer, string path) {
        IntPtr handle;
        if (!OpenPrinter(printer, out handle, IntPtr.Zero)) return "Could not open printer " + printer;
        DocInfo doc = new DocInfo();
        doc.pDocName = "Receipt";
        doc.pDataType = "RAW";
        if (!StartDocPrinter(handle, 1, doc)) {
            ClosePrinter(handle);
            return "Could not start a RAW print job";
        }
        StartPagePrinter(handle);
        byte[] bytes = File.ReadAllBytes(path);
        int written;
        bool ok = WritePrinter(handle, bytes, bytes.Length, out written);
        EndPagePrinter(handle);
        EndDocPrinter(handle);
        ClosePrinter(handle);
        return ok && written == bytes.Length ? "ok" : "Printer did not accept the receipt";
    }
}
"@

$result = [ReceiptRaw]::Send($Printer, $Path)
Write-Output $result
if ($result -ne "ok") { exit 1 }
