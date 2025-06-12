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

test('Realizando login como Admin e criando artigo', async ({ page }) => {
    
    // Acessar a página de login com fallback seguro
    await safeGoto(page, 'http://localhost:1337/admin');

    // Logando na conta
    await page.fill('input[name="email"]', 'admin@satc.edu.br');
    await page.fill('input[name="password"]', 'welcomeToStrapi123');
    await page.click('button[type="submit"] span:has-text("Login")');

    // Entrando na página Content Manager
    await page.click('a:has(span:has-text("Content Manager"))');

    // Entrando na tag Artigo
    await page.click('a:has(div:has(span:has-text("Artigo")))');

    // Criando um Artigo
    await page.click('a:has(span:has-text("Create new entry"))');
    await page.fill('input[name="title"]', faker.person.jobArea());
    await page.fill('textarea[name="description"]', faker.person.jobDescriptor());
    
    await page.keyboard.press('Tab');
    
    const focusedElement1 = page.locator(':focus');
    await focusedElement1.click();

    const box1 = await focusedElement1.boundingBox();

    if (box1) {
        await page.mouse.click(box1.x + box1.width / 2, box1.y + box1.height + 15);
    }

    await page.waitForTimeout(200);
    await page.keyboard.press('Tab');
    await page.waitForTimeout(200);
    await page.keyboard.press('Tab');
    await page.waitForTimeout(200);
    await page.keyboard.press('Tab');
    
    const focusedElement2 = page.locator(':focus');
    await focusedElement2.click();

    const box2 = await focusedElement2.boundingBox();

    if (box2) {
        await page.mouse.click(box2.x + box2.width / 2, box2.y + box2.height + 15);
    }

    await page.click('h2:has-text("Entry")');
    await page.waitForTimeout(200);

    // Salvar o rascunho
    await page.click('button:has(span:has-text("Save"))');

    // Deslogar
    await page.click('span.sc-Qotzb.jopkZf.sc-dKREkF.kGPoCp');
    await page.click('span:has-text("Log out")');

    // Verificar retorno para tela inicial
    await expect(page.locator('text=Welcome to Strapi!')).toBeVisible();
});
