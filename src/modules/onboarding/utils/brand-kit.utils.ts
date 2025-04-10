import {
  BrandKitResponseDto,
  BrandTool,
  Service,
} from '../dto/brandKitResponseDto';

/**
 * Ensures output is a clean array of `Service` with source = 'user'
 */
export function normalizeUserServices(raw: unknown): Service[] {
  if (!Array.isArray(raw)) return [];

  return raw
    .filter(
      (item): item is { name: string; price: number } =>
        typeof item?.name === 'string' && typeof item?.price === 'number',
    )
    .map((svc) => ({
      ...svc,
      source: 'user',
    }));
}

/**
 * Ensures output is a clean array of `BrandTool` with source = 'user'
 */
export function normalizeUserTools(raw: unknown): BrandTool[] {
  if (!Array.isArray(raw)) return [];

  return raw
    .map((tool): BrandTool | null => {
      if (typeof tool === 'string') {
        return { name: tool, source: 'user', checked: true };
      }

      if (
        typeof tool === 'object' &&
        tool !== null &&
        typeof tool.name === 'string'
      ) {
        const source: 'user' | 'ai' = tool.source === 'ai' ? 'ai' : 'user';

        const checked: boolean =
          typeof tool.checked === 'boolean' ? tool.checked : true;

        return {
          name: tool.name,
          source,
          checked,
        };
      }

      return null;
    })
    .filter((t): t is BrandTool => t !== null);
}

/**
 * Returns a filtered brand kit if not paid — otherwise returns full kit.
 */
export function filterBrandKitByAccess(
  kit: BrandKitResponseDto,
): BrandKitResponseDto {
  if (kit.is_paid) return kit;

  const limitedServices: Service[] = [
    ...kit.services.filter((s) => s.source === 'user'),
    ...kit.services.filter((s) => s.source === 'ai').slice(0, 1),
  ];

  const limitedTools: BrandTool[] = [
    ...kit.tools.filter((t) => t.source === 'user'),
    ...kit.tools.filter((t) => t.source === 'ai').slice(0, 2),
  ];

  return {
    ...kit,
    services: limitedServices,
    tools: limitedTools,
  };
}
