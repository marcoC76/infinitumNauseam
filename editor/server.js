const express = require('express');
const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');
const { marked } = require('marked');

const app = express();
const POSTS_DIR = path.join(__dirname, '..', '_posts');

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

marked.setOptions({ breaks: true, gfm: true });

function slugFromFilename(filename) {
  return filename.replace(/^\d{4}-\d{2}-\d{2}-/, '').replace(/\.md$/, '');
}

function parsePost(filepath, filename) {
  const raw = fs.readFileSync(filepath, 'utf-8');
  const { data, content } = matter(raw);
  const slug = slugFromFilename(filename);
  return {
    slug,
    filename,
    title: data.title || 'Sin título',
    date: data.date ? new Date(data.date).toISOString().split('T')[0] : filename.slice(0, 10),
    categories: data.categories || [],
    reading_time: data.reading_time || 0,
    content: content.trim(),
  };
}

app.get('/api/posts', (req, res) => {
  try {
    const files = fs.readdirSync(POSTS_DIR)
      .filter(f => f.endsWith('.md'))
      .sort()
      .reverse();

    const posts = files.map(file =>
      parsePost(path.join(POSTS_DIR, file), file)
    );

    res.json(posts.map(({ content, ...rest }) => rest));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/posts/:slug', (req, res) => {
  try {
    const files = fs.readdirSync(POSTS_DIR).filter(f => f.endsWith('.md'));
    const file = files.find(f => f.includes(req.params.slug));
    if (!file) return res.status(404).json({ error: 'Post no encontrado' });
    res.json(parsePost(path.join(POSTS_DIR, file), file));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/posts', (req, res) => {
  try {
    const { title, date, categories, reading_time, content } = req.body;
    if (!title || !date) return res.status(400).json({ error: 'Título y fecha son requeridos' });

    const slug = title
      .toLowerCase()
      .replace(/[^\w\sáéíóúüñ-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
      .trim() || 'sin-titulo';

    const filename = `${date}-${slug}.md`;
    const filepath = path.join(POSTS_DIR, filename);

    if (fs.existsSync(filepath)) {
      return res.status(409).json({ error: 'Ya existe un post con ese slug', slug });
    }

    const cats = typeof categories === 'string'
      ? categories.split(',').map(c => c.trim()).filter(Boolean)
      : (categories || []);

    const frontmatter = {
      title,
      date,
      categories: cats,
      reading_time: reading_time || 1,
    };

    const fileContent = matter.stringify(content || '', frontmatter);
    fs.writeFileSync(filepath, fileContent, 'utf-8');

    res.json({ slug, filename, message: 'Post creado exitosamente' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/posts/:slug', (req, res) => {
  try {
    const files = fs.readdirSync(POSTS_DIR).filter(f => f.endsWith('.md'));
    const file = files.find(f => f.includes(req.params.slug));
    if (!file) return res.status(404).json({ error: 'Post no encontrado' });

    const filepath = path.join(POSTS_DIR, file);
    const raw = fs.readFileSync(filepath, 'utf-8');
    const parsed = matter(raw);

    const mergedData = { ...parsed.data };
    const { title, date, categories, reading_time, content } = req.body;

    if (title !== undefined) mergedData.title = title;
    if (date !== undefined) mergedData.date = date;
    if (categories !== undefined) {
      mergedData.categories = typeof categories === 'string'
        ? categories.split(',').map(c => c.trim()).filter(Boolean)
        : categories;
    }
    if (reading_time !== undefined) mergedData.reading_time = reading_time;

    const newContent = content !== undefined ? content : parsed.content;
    const fileContent = matter.stringify(newContent, mergedData);
    fs.writeFileSync(filepath, fileContent, 'utf-8');

    res.json({ message: 'Post actualizado exitosamente' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/posts/:slug', (req, res) => {
  try {
    const files = fs.readdirSync(POSTS_DIR).filter(f => f.endsWith('.md'));
    const file = files.find(f => f.includes(req.params.slug));
    if (!file) return res.status(404).json({ error: 'Post no encontrado' });

    fs.unlinkSync(path.join(POSTS_DIR, file));
    res.json({ message: 'Post eliminado' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/preview', (req, res) => {
  try {
    const html = marked.parse(req.body.markdown || '');
    res.json({ html });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`\n  📝  Editor local de relatos`);
  console.log(`  ─────────────────────────`);
  console.log(`  http://localhost:${PORT}\n`);
});
