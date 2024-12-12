/**
 * Fetcher function to fetch data from the API
 *
 * @param url
 */
export function fetcher(url: string) {
    return fetch(url).then((res) => res.json());
}
