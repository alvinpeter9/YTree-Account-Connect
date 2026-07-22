import { expect, test } from "@playwright/test";

test("completes every statement before submitting", async ({ page }) => {
  const today = new Date().toISOString().slice(0, 10);

  await page.goto("/");

  const submitButton = page.getByRole("button", { name: "Submit statements" });
  await expect(submitButton).toBeDisabled();

  const hsbcRow = page.locator("article").filter({ hasText: "HSBC" });
  await hsbcRow.getByRole("button", { name: "Upload" }).click();
  await page
    .getByLabel(/Statement file/)
    .setInputFiles("e2e/fixtures/demo-statement.pdf");
  await page.getByLabel("Statement date").fill(today);
  await page.getByRole("button", { name: "Save statement" }).click();
  await expect(hsbcRow.getByText("Current")).toBeVisible();

  const vanguardRow = page.locator("article").filter({ hasText: "Vanguard" });
  await vanguardRow.getByRole("button", { name: "Replace" }).click();
  await page
    .getByLabel(/Statement file/)
    .setInputFiles("e2e/fixtures/demo-statement.pdf");
  await page.getByLabel("Statement date").fill(today);
  await page.getByRole("button", { name: "Save statement" }).click();
  await expect(vanguardRow.getByText("Current")).toBeVisible();

  await expect(submitButton).toBeEnabled();
  await submitButton.click();

  await expect(
    page.getByRole("heading", { name: "Your statements are on their way" }),
  ).toBeVisible();
});
