declare module '*.css' {
  const content: Record<string, string>;
  export default content;
}

// Allow importing .js lib modules without type declarations
declare module '../lib/*' {
  const value: any;
  export default value;
  export const client: any;
  export const DATABASE_ID: string;
}

declare module '../../lib/*' {
  const value: any;
  export default value;
  export const client: any;
  export const DATABASE_ID: string;
}

declare module '../../../lib/*' {
  const value: any;
  export default value;
  export const client: any;
  export const DATABASE_ID: string;
}
