export type SearchResult = {
    id: string;
    type: 'product' | 'meal' | 'user' | 'brand' | 'tag' | 'lead' | 'plan';
    title: string;
    subtitle?: string;
    url: string;
    imageUrl?: string;
};
