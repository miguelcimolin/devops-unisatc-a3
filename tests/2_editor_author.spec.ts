import { test, expect, Page } from '@playwright/test';
import { faker } from '@faker-js/faker';

// Função segura para acessar uma URL com retry (evita falhas de conexão temporárias)
async function safeGoto(page: Page, url: string, retries = 5, delay = 1000) {
    for (let i = 0; i < retries; i++) {
        try {
            await page.goto(url);
            return;
        } catch (e) {
            if (e.message.includes('ECONNREFUSED')) {
                console.log(`Tentativa ${i + 1} falhou com ECONNREFUSED. Tentando novamente em ${delay}ms...`);
                await page.waitForTimeout(delay);
            } else {
                throw e; // erro não relacionado a conexão, rethrow
            }
        }
    }
    throw new Error(`Falha ao acessar ${url} após ${retries} tentativas`);
}

test('Realizando login como Editor e criando author', async ({ page }) => {
    
    // Acessar a página de login
    await safeGoto(page, 'http://localhost:1337/admin');

    // Logando na conta
    await page.fill('input[name="email"]', 'editor@satc.edu.br');
    await page.fill('input[name="password"]', 'welcomeToStrapi123');
    await page.click('button[type="submit"] span:has-text("Login")');

    // Entrando na página Content Manager
    await page.click('a:has(span:has-text("Content Manager"))');

    // Entrando na tag Autor
    await page.click('a:has(div:has(span:has-text("Autor")))');
    // await page.click('a:has(div:has(span:has-text("Teste V2")))');

    // Criando um Autor
    await page.click('a:has(span:has-text("Create new entry"))');
    await page.fill('input[name="name"]', faker.person.fullName());
    await page.click('button:has(span:has-text("Save"))');

    // Deslogando da conta
    await page.click('span.sc-Qotzb.jopkZf.sc-dKREkF.kGPoCp');
    await page.click('span:has-text("Log out")');
    
    // Verificar se voltou para a tela inicial com "Welcome to Strapi!"
    await expect(page.locator('text=Welcome to Strapi!')).toBeVisible();
});