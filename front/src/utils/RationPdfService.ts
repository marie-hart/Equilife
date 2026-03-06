import html2pdf from 'html2pdf.js';

export const generateRationPDF = async (ration: any, horseName: string, getProductName: Function) => {
  const meals = ['matin', 'midi', 'soir']
    .map(key => ({
      label: key.toUpperCase(),
      items: ration.items.filter((i: any) => i.frequency.includes(key))
    }))
    .filter(m => m.items.length > 0);

  const element = document.createElement('div');
  
  // Design avec ton logo Equilife
  element.innerHTML = `
    <div style="padding: 30px; font-family: 'Playfair Display', serif; background-color: #FDFBF9; color: #2E4B36;">
      <div style="text-align: center; margin-bottom: 30px;">
        <img src="/splash-logo.jpg" style="width: 120px; margin-bottom: 10px;" />
        <h1 style="font-size: 26px; margin: 0; color: #2E4B36; letter-spacing: 1px;">Fiche Alimentation</h1>
        <div style="width: 50px; height: 3px; background-color: #7B5B3E; margin: 10px auto; border-radius: 2px;"></div>
      </div>

      <div style="margin-bottom: 30px; padding: 20px; border: 1px solid #EDE4D8; border-radius: 15px; background-color: white;">
        <div style="font-size: 20px; font-weight: bold;">${horseName}</div>
        <div style="font-size: 14px; color: #7B5B3E; margin-top: 5px;">Ration : ${ration.name}</div>
      </div>

      ${meals.map(meal => `
        <div style="margin-top: 25px; page-break-inside: avoid;">
          <div style="display: flex; align-items: center; margin-bottom: 10px;">
            <div style="background: #2E4B36; color: white; padding: 5px 15px; border-radius: 20px; font-size: 14px; font-weight: bold;">
              ${meal.label}
            </div>
          </div>
          <table style="width: 100%; border-collapse: collapse;">
            ${meal.items.map((item: any) => `
              <tr style="border-bottom: 1px solid #EDE4D8;">
                <td style="padding: 12px 5px; font-weight: 600;">${getProductName(item.product_id) || 'Produit'}</td>
                <td style="padding: 12px 5px; text-align: right; color: #7B5B3E; font-weight: bold;">
                  ${item.quantity}
                </td>
              </tr>
            `).join('')}
          </table>
        </div>
      `).join('')}

      <div style="margin-top: 50px; text-align: center; font-size: 10px; color: #A89F94;">
        Document généré par Equilife • ${new Date().toLocaleDateString('fr-FR')}
      </div>
    </div>
  `;

  const opt = {
    margin: 10,
    filename: `Ration_${horseName.replace(/\s+/g, '_')}.pdf`,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { 
        scale: 2, 
        useCORS: true,
        letterRendering: true 
    },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
  };

  // On utilise l'export par défaut correctement
  return (html2pdf() as any).from(element).set(opt).save();
};