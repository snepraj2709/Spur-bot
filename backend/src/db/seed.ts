import { pathToFileURL } from "node:url";
import { getDb } from "./client.js";
import { migrate } from "./migrate.js";

const faqEntries = [
  {
    id: "return-refund-policy",
    question: "What is your return policy?",
    answer:
      "Customers can return eligible items within 30 days of delivery. Refunds are processed after the returned item is inspected."
  },
  {
    id: "shipping-policy",
    question: "Do you ship to USA?",
    answer:
      "We offer standard shipping in 3-5 business days and express shipping in 1-2 business days. We currently ship across India and to the USA."
  },
  {
    id: "support-hours",
    question: "What are your support hours?",
    answer:
      "Support is available Monday to Friday, 9:00 AM to 6:00 PM IST."
  }
];

export function seed() {
  migrate();

  const statement = getDb().prepare(`
    INSERT INTO faq_entries (id, question, answer)
    VALUES (@id, @question, @answer)
    ON CONFLICT(id) DO UPDATE SET
      question = excluded.question,
      answer = excluded.answer
  `);

  const insertMany = getDb().transaction((entries: typeof faqEntries) => {
    for (const entry of entries) {
      statement.run(entry);
    }
  });

  insertMany(faqEntries);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  seed();
  console.log("Database seed complete.");
}
