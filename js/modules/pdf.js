window.PDF = {
    defaultPdfSettings: {
        headerTitle: { x: 20, y: 20, fontSize: 16, text: 'SECRETARIA MUNICIPAL DE EDUCAÇÃO, ESPORTES E JUVENTUDE' },
        headerDate: { x: 20, y: 30, fontSize: 10, prefix: 'Data:' },
        headerSecretary: { x: 20, y: 40, fontSize: 10, text: 'DEPARTAMENTO DE MERENDA ESCOLAR' },
        departmentLine: { x: 20, y: 46, fontSize: 10, text: '.' },
        logo: { x: 140, y: 15, width: 50, height: 14, src: 'images/logo.png' },
        schoolInfoTitle: { x: 20, y: 60, fontSize: 12, text: ' ' },
        schoolName: { x: 20, y: 67, fontSize: 10, prefix: 'Nome da Escola:' },
        schoolSector: { x: 20, y: 72, fontSize: 10, prefix: 'Setor:' },
        schoolManager: { x: 20, y: 77, fontSize: 10, prefix: 'Gestor(a):' },
        schoolAddress: { x: 20, y: 82, fontSize: 10, prefix: 'Endereço:' },
        schoolModality: { x: 20, y: 87, fontSize: 10, prefix: 'Modalidade:' },
        schoolStudents: { x: 20, y: 92, fontSize: 10, prefix: 'Nº de Alunos:' },
        tableStartY: 105,
        observationsTitle: { x: 20, y: 0, fontSize: 12, text: 'OBSERVAÇÕES:' }, // Y will be dynamic
        observationsText: { x: 20, y: 0, fontSize: 10 }, // Y will be dynamic
        signatureDelivery: { x: 20, y: 250, fontSize: 10, line: '_______________________________________', text: 'Responsável pela Entrega' },
        signatureReceive: { x: 120, y: 250, fontSize: 10, line: '_______________________________________', text: 'Responsável pelo Recebimento' },
    },

    loadPdfSettings: function() {
        try {
            const settings = JSON.parse(localStorage.getItem('pdfSettings'));
            return settings ? { ...this.defaultPdfSettings, ...settings } : this.defaultPdfSettings;
        } catch (error) {
            console.error('Erro ao carregar configurações de PDF do localStorage:', error);
            return this.defaultPdfSettings;
        }
    },

    savePdfSettings: function(settings) {
        try {
            localStorage.setItem('pdfSettings', JSON.stringify(settings));
            pdfSettings = settings; // Update global variable
            console.log('Configurações de PDF salvas no localStorage');
        } catch (error) {
            console.error('Erro ao salvar configurações de PDF no localStorage:', error);
        }
    },

    generateOrderPdf: async function(orderData, savePdf = false) {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        const settings = this.loadPdfSettings();

        let yOffset = 10; // Initial Y position

        // Load logo asynchronously
        const logoImg = new Image();
        logoImg.src = settings.logo.src;

        await new Promise((resolve, reject) => {
            logoImg.onload = () => resolve();
            logoImg.onerror = () => {
                console.warn('Não foi possível carregar a logo. Usando placeholder.');
                reject();
            };
        });

        // --- HEADER ---
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageCenterX = pageWidth / 2;

        // Logo centralizada acima do título
        const centeredLogoX = (pageWidth - settings.logo.width) / 2;
        const logoY = Math.max(settings.logo.y, 10);
        if (logoImg.complete && logoImg.naturalHeight !== 0) {
            doc.addImage(logoImg, 'PNG', centeredLogoX, logoY, settings.logo.width, settings.logo.height);
        } else {
            doc.setFontSize(10);
            doc.text('LOGO AQUI', centeredLogoX + (settings.logo.width / 2) - 10, logoY + (settings.logo.height / 2));
        }
        const logoBottomY = logoY + settings.logo.height;

        // Título centralizado
        doc.setFontSize(settings.headerTitle.fontSize);
        const titleY = Math.max(logoBottomY + 6, settings.headerTitle.y);
        try {
            doc.text(settings.headerTitle.text, pageCenterX, titleY, { align: 'center' });
        } catch (e) {
            const textWidth = doc.getTextWidth(settings.headerTitle.text);
            const centeredTitleX = pageCenterX - (textWidth / 2);
            doc.text(settings.headerTitle.text, centeredTitleX, titleY);
        }

        // Data logo abaixo do título
        doc.setFontSize(settings.headerDate.fontSize);
        const dateY = Math.max(titleY + 5, settings.headerDate.y);
        doc.text(`${settings.headerDate.prefix} ${orderData.date}`, settings.headerDate.x, dateY);

        // Linha da secretaria centralizada
        const secretaryY = Math.max(dateY + 5, settings.headerSecretary.y);
        doc.setFontSize(settings.headerSecretary.fontSize || 10);
        try {
            doc.text(settings.headerSecretary.text, pageCenterX, secretaryY, { align: 'center' });
        } catch (e) {
            const secWidth = doc.getTextWidth(settings.headerSecretary.text);
            const secX = pageCenterX - (secWidth / 2);
            doc.text(settings.headerSecretary.text, secX, secretaryY);
        }

        // Departamento abaixo da linha da secretaria
        const departmentSettings = settings.departmentLine || {};
        const departmentText = (departmentSettings.text || 'DEPARTAMENTO DE MERENDA ESCOLAR').trim();
        let departmentY = logoBottomY;
        if (departmentText) {
            const departmentFont = departmentSettings.fontSize || settings.headerSecretary.fontSize || 10;
            const targetY = typeof departmentSettings.y === 'number' ? departmentSettings.y : 0;
            departmentY = Math.max(secretaryY + 6, logoBottomY + 6, targetY);
            doc.setFontSize(departmentFont);
            try {
                doc.text(departmentText, pageCenterX, departmentY, { align: 'center' });
            } catch (e) {
                const deptWidth = doc.getTextWidth(departmentText);
                const deptX = pageCenterX - (deptWidth / 2);
                doc.text(departmentText, deptX, departmentY);
            }
        }

        // Início das informações da escola
        yOffset = Math.max(settings.schoolInfoTitle.y - 12, (departmentText ? departmentY : secretaryY) + 4);

        // --- SCHOOL INFORMATION ---
        doc.setFontSize(settings.schoolInfoTitle.fontSize);
        doc.text(settings.schoolInfoTitle.text, settings.schoolInfoTitle.x, yOffset);
        yOffset += 5;
        doc.setFontSize(settings.schoolName.fontSize);
        doc.text(`${settings.schoolName.prefix} ${orderData.school.name}`, settings.schoolName.x, yOffset);
        yOffset += 4;
        doc.text(`${settings.schoolSector.prefix} ${orderData.school.sector}`, settings.schoolSector.x, yOffset);
        yOffset += 4;
        doc.text(`${settings.schoolManager.prefix} ${orderData.school.managerName || 'Não Informado'}`, settings.schoolManager.x, yOffset);
        yOffset += 4;
        doc.text(`${settings.schoolAddress.prefix} ${orderData.school.address || 'Não Informado'}`, settings.schoolAddress.x, yOffset);
        yOffset += 4;
        doc.text(`${settings.schoolModality.prefix} ${orderData.school.modality || 'Não Informado'}`, settings.schoolModality.x, yOffset);
        yOffset += 4;
        doc.text(`${settings.schoolStudents.prefix} ${orderData.school.students || 'Não Informado'}`, settings.schoolStudents.x, yOffset);
        yOffset += 10;

        // --- PRODUCTS TABLE (4 columns) with up to 20 lines per page ---
        const tableColumn = ["PRODUTOS", "QUANTIDADES", "PRODUTOS", "QUANTIDADES"];
        const items = orderData.items || [];
        const tableRows = [];
        for (let i = 0; i < items.length; i += 2) {
            const a = items[i];
            const b = items[i + 1];
            tableRows.push([
                a ? a.product : '',
                a ? `${a.quantity} ${a.unit}` : '',
                b ? b.product : '',
                b ? `${b.quantity} ${b.unit}` : ''
            ]);
        }

        const chunk = (arr, size) => arr.length ? [arr.slice(0, size), ...chunk(arr.slice(size), size)] : [];
        const rowsPerPage = 20; // máximo de 20 linhas por página
        const rowChunks = chunk(tableRows, rowsPerPage);

        let currentY = yOffset;
        rowChunks.forEach((rows, idx) => {
            doc.autoTable({
                startY: currentY,
                head: [tableColumn],
                body: rows,
                theme: 'grid',
                styles: { fontSize: 9, cellPadding: 1.5, overflow: 'linebreak', fontStyle: 'bold', textColor: [0, 0, 0], lineColor: [0, 0, 0], lineWidth: 0.35 },
                headStyles: { fillColor: [255, 255, 153], textColor: [0, 0, 0], fontStyle: 'bold', fontSize: 9 },
                margin: { left: 18, right: 18 },
            });
            currentY = doc.autoTable.previous.finalY + 10;
            const isLast = idx === rowChunks.length - 1;
            if (!isLast) {
                doc.addPage();
                // reset Y near top margin in new page
                currentY = 18;
            }
        });
        yOffset = currentY; // after last table chunk

        // --- OBSERVATIONS (last page only) ---
        if (orderData.observations) {
            const pageHeight = doc.internal.pageSize.getHeight();
            // If too close to bottom, add a page
            if (yOffset + 30 > pageHeight - 36) { doc.addPage(); yOffset = 18; }
            doc.setFontSize(settings.observationsTitle.fontSize);
            doc.text(settings.observationsTitle.text, settings.observationsTitle.x, yOffset);
            yOffset += 7;
            doc.setFontSize(settings.observationsText.fontSize);
            doc.text(orderData.observations, settings.observationsText.x, yOffset);
            yOffset += 12;
        }

        // --- FOOTER (SIGNATURES on last page, anchored near bottom) ---
        const pageHeight = doc.internal.pageSize.getHeight();
        const sigBaseY = Math.max(yOffset + 8, pageHeight - 28); // keep signatures near bottom while using space
        doc.setFontSize(settings.signatureDelivery.fontSize);
        doc.text(settings.signatureDelivery.line, settings.signatureDelivery.x, sigBaseY);
        doc.text(settings.signatureDelivery.text, settings.signatureDelivery.x, sigBaseY + 5);
        const rightSigX = settings.signatureReceive.x;
        doc.text(settings.signatureReceive.line, rightSigX, sigBaseY);
        doc.text(settings.signatureReceive.text, rightSigX, sigBaseY + 5);

        if (savePdf) {
            const fileName = `pedido_${orderData.school.name.replace(/\s+/g, '_')}_${Date.now()}.pdf`;
            doc.save(fileName);
        } else {
            this.renderPdfPreview(doc.output('dataurlstring'));
        }
    },

    renderPdfPreview: function(pdfDataUrl) {
        if (domElements.pdfPreviewIframe) {
            const iframe = domElements.pdfPreviewIframe;
            iframe.onload = () => {
                if (this._autoPrint) {
                    try { iframe.contentWindow.focus(); iframe.contentWindow.print(); } catch (e) {}
                    this._autoPrint = false;
                }
                iframe.onload = null;
            };
            iframe.src = pdfDataUrl;
            domElements.pdfPreviewModal.style.display = 'flex';
            // trigger animation class if available
            requestAnimationFrame(() => domElements.pdfPreviewModal.classList.add('is-open'));
        }
    },

    printPreview: function() {
        const iframe = domElements.pdfPreviewIframe;
        if (!iframe) return;
        try { iframe.contentWindow.focus(); iframe.contentWindow.print(); } catch (e) {
            // Fallback: open in new tab and print
            const src = iframe.getAttribute('src');
            if (src) {
                const w = window.open(src, '_blank');
                if (w) w.onload = () => w.print();
            }
        }
    },

    printOrder: async function(orderData) {
        this._autoPrint = true;
        await this.generateOrderPdf(orderData, false);
    }
};

console.log('✅ PDF module loaded successfully for user_page');
