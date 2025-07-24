// src/request-forms/request-form-db.service.ts
import { Injectable } from '@nestjs/common';
import { DatabaseService } from 'src/common/database/database.service'; // Import your generic DatabaseService
import { ProductRequestDto } from './dto/product-request.dto';

@Injectable()
export class RequestFormDbService {
  constructor(private readonly db: DatabaseService) {} // Inject the generic DatabaseService

  /**
   * Saves a new product request form submission to the 'request_forms' table.
   * @param payload The ProductRequestDto object containing all form data.
   * @returns The inserted row's ID and creation timestamp.
   */
  async createProductRequest(
    payload: ProductRequestDto, // ✅ UPDATED: Accept the entire DTO object
  ): Promise<{ id: string; created_at: Date }> {
    const queryText = `
      INSERT INTO public.request_forms (
        email,
        niche,
        audience_questions,
        audience_platforms_and_size,
        content_type,
        product_idea,
        created_at -- Only include created_at if you want to explicitly set it or return it
      )
      VALUES ($1, $2, $3, $4, $5, $6, NOW()) -- NOW() for created_at
      RETURNING id, created_at;
    `;
    const values = [
      payload.email,
      payload.niche,
      payload.audienceQuestions,
      payload.audiencePlatformsAndSize,
      payload.contentType,
      payload.productIdea,
    ];

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
