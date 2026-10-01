const LOCAL_PRINT_URL = 'http://127.0.0.1:9177/print';

export async function sendToLocalPrinter(printerName: string, payload: string): Promise<void> {
  let res: Response;
  try {
    res = await fetch(LOCAL_PRINT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ printerName, payload }),
    });
  } catch {
    throw new Error('Print agent is not running on this PC. Start start-print-agent.bat, then print again.');
  }
  if (!res.ok) {
    let message = 'This PC could not print to ' + printerName;
    try {
      const body = await res.json();
      if (body?.error) message = body.error;
    } catch {
      /* the agent returned plain text */
    }
    throw new Error(message);
  }
}
