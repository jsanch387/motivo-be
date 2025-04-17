// src/features/brandKit/helpers/normalizeAndFilter.ts

import { BrandKitResponseDto, Tool, Service } from '../dto/brandKitResponseDto';

/**
 * Ensures output is a clean array of `Service`
 */
export function normalizeUserServices(raw: unknown): Service[] {
  if (!Array.isArray(raw)) return [];

  return raw
    .filter(
      (item): item is { id?: string; name: string; price: number } =>
        typeof item?.name === 'string' && typeof item?.price === 'number',
    )
    .map((svc) => ({
      id: svc.id ?? crypto.randomUUID(),
      name: svc.name,
      price: svc.price,
    }));
}

/**
 * Ensures output is a clean array of `Tool`
 */
export function normalizeUserTools(raw: unknown): Tool[] {
  if (!Array.isArray(raw)) return [];

  return raw
    .map(
      (
        tool: { id?: string; name: string; checked?: boolean } | string,
      ): Tool | null => {
        if (typeof tool === 'string') {
          return {
            id: crypto.randomUUID(),
            name: tool,
            checked: true,
          };
        }

        if (
          typeof tool === 'object' &&
          tool !== null &&
          typeof tool.name === 'string'
        ) {
          return {
            id: tool.id ?? crypto.randomUUID(),
            name: tool.name,
            checked: typeof tool.checked === 'boolean' ? tool.checked : true,
          };
        }

        return null;
      },
    )
    .filter((t): t is Tool => t !== null);
}

/**
 * Returns a filtered brand kit if not paid — otherwise returns full kit.
 */
export function filterBrandKitByAccess(
  kit: BrandKitResponseDto,
): BrandKitResponseDto {
  if (kit.is_paid) return kit;

  return {
    ...kit,
    suggested_services: kit.suggested_services.slice(0, 2), // show 2 AI suggestions
    suggested_tools: kit.suggested_tools.slice(0, 2), // show 2 AI tools
  };
}
