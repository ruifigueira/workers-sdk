import { launch } from "@cloudflare/playwright";

type Env = {
	MYBROWSER: Fetcher;
};

export default {
	async fetch(request, env) {
		const browser = await launch(env.MYBROWSER);
		const page = await browser.newPage();
		const meaningOfLife = await page.evaluate(() => {
			return 42;
		});
		await browser.close();
		return new Response(`The meaning of life is ${meaningOfLife}`);
	},
} satisfies ExportedHandler<Env>;
