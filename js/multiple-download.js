function downloadMultiplePDFs(event) {
    event.preventDefault(); // Evita que el enlace navegue a "#"

    const urls = [
        "https://drive.google.com/uc?export=download&id=1gAoeagoAVEp5H-P5fG_odpl6LVwVVwTP",
        "https://drive.google.com/uc?export=download&id=1R0gQzgTNiBetPFgW5e8BNbExSVRAxYzi"
    ];

    urls.forEach((url, index) => {
        const a = document.createElement("a");
        a.href = url;
        a.download = `archivo${index + 1}.pdf`; // Cambia el nombre si deseas
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    });
}