export default function validateEmailTemplate(name: string, token: string): string {
    return `
    <div style="
        font-family: Arial, sans-serif;
        background-color: #f4f4f5;
        padding: 40px 10px;
    ">
        <div style="
            max-width: 600px;
            margin: auto;
            background-color: #fff;
            border-radius: 10px;
            overflow: hidden;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            border: 1px solid #ddd;">
            
            <div style="text-align: center; padding: 30px 20px; background-color: #B648A0;">
                <img src="https://via.placeholder.com/80x40?text=MyPets" alt="MyPets Logo"
                    style="display:block; margin:auto;">
            </div>

            <div style="padding: 30px 25px; text-align: center; color: #332630;">
                <h2 style="color: #B648A0; font-size: 24px; margin-bottom: 20px;">Confirmação de Email</h2>
                <p style="font-size: 16px; margin-bottom: 20px;">Olá, ${name},</p>
                <p style="font-size: 16px; margin-bottom: 30px;">
                    Obrigado por se cadastrar na MyPets! 
                </p>
                <p>Para ativar sua conta, clique no botão abaixo:</p>

                <a href="http://localhost:3000/validate-email?token=${token}" style="
                        display: inline-block;
                        padding: 14px 25px;
                        font-size: 16px;
                        font-weight: bold;
                        color: #fff;
                        background-color: #B648A0;
                        text-decoration: none;
                        border-radius: 6px;
                    ">
                    Validar Email
                </a>

                <p style="font-size: 14px; color: #61475C; margin-top: 30px;">
                    Se você não se cadastrou na MyPets, ignore este email.
                </p>
            </div>

            <div style="text-align: center; font-size: 12px; color: #888; padding: 20px;">
                <hr style="border: none; border-top: 1px solid #ddd; margin: 15px 0;">
                <p>Atenciosamente,</p>
                <p><strong>Equipe MyPets</strong></p>
                <p style="margin-top: 10px;">&copy; 2025 MyPets. Todos os direitos reservados.</p>
            </div>
        </div>
    </div>
    `;
}
