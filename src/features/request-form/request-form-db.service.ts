// src/request-forms/request-form-db.service.ts
import { Injectable } from '@nestjs/common';
import { DatabaseService } from 'src/common/database/database.service'; // Import your generic DatabaseService

@Injectable()
export class RequestFormDbService {
  constructor(private readonly db: DatabaseService) {} // Inject the generic DatabaseService

  /**
   * Saves a new product request form submission to the 'request_forms' table.
   * @param email The email address from the form.
   * @param niche The creator's niche/content area.
   * @param audienceQuestions Top questions the audience asks.
   * @returns The inserted row's ID and creation timestamp.
   */
  async createProductRequest(
    email: string,
    niche: string,
    audienceQuestions: string,
  ): Promise<{ id: string; created_at: Date }> {
    const queryText = `
      INSERT INTO public.request_forms (email, niche, audience_questions)
      VALUES ($1, $2, $3)
      RETURNING id, created_at;
    `;
    const values = [email, niche, audienceQuestions];

    console.log('💾 Inserting new product request into request_forms table...');
    const result = await this.db.queryOneOrNull<{
      id: string;
      created_at: Date;
    }>(queryText, values);

    if (!result) {
      // This case should ideally not happen for an INSERT with RETURNING,
      // but it's good for type safety and explicit handling.
      throw new Error('Failed to retrieve inserted product request data.');
    }

    console.log('✅ Product request inserted with ID:', result.id);
    return result;
  }

  // You can add other request_forms specific queries here later, e.g.,
  // async getProductRequests(): Promise<any[]> { ... }
  // async getProductRequestById(id: string): Promise<any | null> { ... }
}
