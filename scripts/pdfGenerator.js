/*
Генератор отчетов в формате PDF
Сохраняется значение y для размещения элементов на станицах
Реализовано:
Добавление таблиц
Добавление текста
Добавление заголовков разных уровней
Добавление нумерации страниц
Генерация оглавления с ссылками на заголовки
Добавление канвасов как картинок
Сохранение файла и его загрузка на компьютер
*/

class PDFGenerator {
    constructor() {
        this.doc = new jspdf.jsPDF();
        this.tableCounter = 0;
        this.figureCounter = 0;
        this.tocEntries = [];
        this.globalY = 20

        this._maxY = 290

        this.doc.setFont("Times New Roman", "normal");
    }

    addTableToPDF(head, body, label) {
        this.tableCounter += 1;
        const tableLabel = `Таблица ${this.tableCounter}. ${label}`;
        
        this.doc.setFont("Times New Roman", "normal");
        this.doc.setFontSize(14);
        this.doc.text(tableLabel, 14, this.globalY);

        if (this.globalY + 20 > this._maxY){
            this.addPBToPDF()
        }

        this.doc.autoTable({
            head: head,
            body: body,
            styles: {
                font: 'Times New Roman',
                fontStyle: 'normal',
              },
            startY: this.globalY + 5,
        });
        this.globalY = this.doc.lastAutoTable.finalY + 15
    }

    addTextToPDF(text) {
        this.doc.setFont("Times New Roman", "normal");
        this.doc.setFontSize(14);
        const pageWidth = this.doc.internal.pageSize.width;
        const textWidth = this.doc.getTextWidth(text);

        if (this.globalY + 14 > this._maxY){
            this.addPBToPDF()
        }

        this.doc.text(text, (pageWidth - textWidth) / 2, this.globalY);
        this.globalY += 14
    }

    addTitleToPDF(titleText, level = 1) {
        const fontSize = 22 - (level - 1) * 2;
        this.doc.setFont("Times New Roman", "bold");
        this.doc.setFontSize(fontSize);

        const pageWidth = this.doc.internal.pageSize.width;
        const textWidth = this.doc.getTextWidth(titleText);

        if (this.globalY + fontSize > this._maxY){
            this.addPBToPDF()
        }

        this.doc.text(titleText, (pageWidth - textWidth) / 2, this.globalY);

        this.globalY += fontSize - 5

        this.tocEntries.push({
            title: titleText,
            pageNumber: this.doc.internal.getCurrentPageInfo().pageNumber + 1,
            level,
            x: 14,
            y: this.globalY
        });
    }

    async addCanvasToPDF(canvasElement, label) {
        const canvas = canvasElement;
        this.figureCounter += 1;
        const figureLabel = `Рисунок ${this.figureCounter}. ${label}`;
        this.doc.setFont("Times New Roman", "normal");
        this.doc.setFontSize(14);
        
        const pageWidth = this.doc.internal.pageSize.width;
        const textWidth = this.doc.getTextWidth(label);

        const imgData = await this.captureCanvasImage(canvas);

        const imgWidth = this.doc.internal.pageSize.width - 40;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;

        if (this.globalY + imgHeight + 20 > this._maxY){
            this.addPBToPDF()
        }
        this.doc.addImage(imgData, "PNG", 20, this.globalY, imgWidth, imgHeight);
        this.doc.text(figureLabel, (pageWidth - textWidth) / 2, this.globalY + imgHeight + 7);
        this.globalY += imgHeight + 35
    }

    captureCanvasImage(canvas) {
        return new Promise((resolve, reject) => {
            html2canvas(canvas).then((canvas) => {
                const imgData = canvas.toDataURL("image/png");
                resolve(imgData);
            }).catch(reject);
        });
    }

    addPBToPDF() {
        this.doc.addPage();
        this.globalY = 20
    }

    addToCToPDF() {
        if (this.tocEntries.length === 0) return;

        const originalPage = this.doc.internal.getCurrentPageInfo().pageNumber;
        
        const pageWidth = this.doc.internal.pageSize.width;
        const textWidth = this.doc.getTextWidth("Оглавление");

        this.doc.insertPage(1);
        this.doc.setFont("Times New Roman", "bold");
        this.doc.setFontSize(18);
        this.doc.text("Оглавление", (pageWidth - textWidth) / 2, 20);

        this.doc.setFont("Times New Roman", "normal");
        this.doc.setFontSize(14);

        let yOffset = 30;
        this.tocEntries.forEach((entry) => {
            const linkText = `${" ".repeat(entry.level * 2)}${entry.title}`;
            const linkX = 14;
            const linkY = yOffset;

            this.doc.text(linkText, linkX, linkY);
            this.doc.text(String(entry.pageNumber - 1), this.doc.internal.pageSize.width - 20, yOffset, { align: "right" });

            this.doc.link(linkX, linkY - 3, this.doc.getTextWidth(linkText), 10, {
                pageNumber: entry.pageNumber,
                x: entry.x,
                y: entry.y
            });

            yOffset += 10;
        });
    }

    addPageNumberingToPDF() {
        const pageCount = this.doc.internal.getNumberOfPages();

        for (let i = 1; i < pageCount; i++) {
            this.doc.setPage(i + 1);
            const pageWidth = this.doc.internal.pageSize.width;
            this.doc.setFont("Times New Roman", "normal");
            this.doc.setFontSize(10);
            this.doc.text(i.toString(), pageWidth / 2, this.doc.internal.pageSize.height - 10, { align: "center" });
        }
    }

    downloadPDF(filename = "Report.pdf") {
        this.addToCToPDF();
        this.addPageNumberingToPDF();
        this.doc.save(filename);
    }
}
