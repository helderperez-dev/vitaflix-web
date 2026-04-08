interface ParsedName {
    firstName: string;
    lastName: string;
}

/**
 * Parses a full name into a first name and a last name.
 * @param fullName The full name to parse.
 * @returns An object containing the firstName and lastName.
 */
export function parseName(fullName: string | undefined): ParsedName {
    if (!fullName || typeof fullName !== 'string') {
        return { firstName: '', lastName: '' };
    }

    const trimmedName = fullName.trim();
    if (!trimmedName) {
        return { firstName: '', lastName: '' };
    }

    const parts = trimmedName.split(/\s+/);
    
    if (parts.length === 1) {
        return { firstName: parts[0], lastName: '' };
    }

    const firstName = parts[0];
    const lastName = parts.slice(1).join(' ');

    return { firstName, lastName };
}

/**
 * Synchronizes a contact with Brevo, adding them to the Waiting List.
 * @param email The contact's email address.
 * @param name The contact's full name.
 * @returns A boolean indicating success or failure.
 */
export async function syncContactWithBrevo(email: string, name?: string): Promise<boolean> {
    if (!email) return false;

    const apiKey = process.env.BREVO_API_KEY;
    if (!apiKey) {
        console.warn('BREVO_API_KEY is not defined. Skipping Brevo sync.');
        return false;
    }

    const { firstName, lastName } = parseName(name);

    try {
        const response = await fetch('https://api.brevo.com/v3/contacts', {
            method: 'POST',
            headers: {
                'accept': 'application/json',
                'content-type': 'application/json',
                'api-key': apiKey
            },
            body: JSON.stringify({
                email,
                attributes: {
                    FIRSTNAME: firstName,
                    LASTNAME: lastName
                },
                listIds: [2],
                updateEnabled: true
            })
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => null);
            console.error(`Brevo API error (${response.status}):`, errorData);
            return false;
        }

        return true;
    } catch (error) {
        console.error('Failed to sync contact with Brevo:', error);
        return false;
    }
}
