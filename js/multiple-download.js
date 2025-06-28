function downloadMultiplePDFs(event) {
    event.preventDefault();

    const urls = [
        "https://raw.githubusercontent.com/Tiburonchin/GUIAS-PDS/main/Actividad%206.pdf",
        "https://raw.githubusercontent.com/Tiburonchin/GUIAS-PDS/main/Constancia%20de%20Matricula-11-01-2025%2018_45_23.pdf"
    ];

    urls.forEach((url, index) => {
        setTimeout(() => {
            const a = document.createElement("a");
            a.href = url;
            a.download = `archivo${index + 1}.pdf`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        }, index * 1000); // 1000ms (1 segundo) entre cada descarga
    });
}