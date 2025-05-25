// export function buildJoinGroupsPrompt(location: string) {
//   return `
// You are a helpful business coach for local service businesses.

// Please simulate a Google search like this:
//   "${location} Facebook group buy sell trade site:facebook.com"

// From the top results, return exactly 3 real, currently active Facebook groups that:
// - Are based in or near "${location}"
// - Are **buy/sell/trade** groups or **community/neighborhood** groups
// - Commonly feature local discussion or posts requesting services
// - ARE NOT hobbyist or enthusiast-specific groups (e.g. no “car lovers”, “dog owners”, etc.)

// For each group, return:
// - name: The exact title of the Facebook group
// - members: Estimated member count (or use "unknown")
// - url: A working Facebook group URL if available (or "" if not found)

// Respond ONLY in this strict JSON format:
// {
//   "groups": [
//     {
//       "name": "Example Group Name",
//       "members": "4,500 members",
//       "url": "https://facebook.com/groups/example"
//     },
//     ...
//   ]
// }

// Do not include tips, commentary, or extra notes.
// Return only valid, parseable JSON.
//   `;
// }
