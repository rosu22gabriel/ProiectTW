async function fetchWikipediaSummary(req, res) {
    try {
        const title = String(req.query.title || '').trim();
        if (!title) {
            return res.status(400).json({ message: 'title este obligatoriu.' });
        }

        const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`;
        const response = await fetch(url);
        if (!response.ok) {
            return res.status(404).json({ message: 'Pagina Wikipedia nu a fost gasita.' });
        }

        const data = await response.json();
        return res.status(200).json({
            title: data.title,
            extract: data.extract,
            url: data.content_urls?.desktop?.page || `https://en.wikipedia.org/wiki/${encodeURIComponent(title)}`,
        });
    } catch (error) {
        return res.status(500).json({ message: 'Nu s-a putut prelua continutul extern.', error: error.message });
    }
}

module.exports = {
    fetchWikipediaSummary,
};
