---
layout: default
title: Archivo
permalink: /archivo/
---

<div class="about-content">
  <h1>> Archivo de relatos</h1>
  <p>Todos los relatos publicados en <span class="dim">infinitumNauseam</span>, ordenados del más reciente al más antiguo.</p>

  <hr>

  {% assign posts_by_year = site.posts | group_by_exp: "post", "post.date | date: '%Y'" %}
  {% for year_group in posts_by_year %}
    <h2>{{ year_group.name }}</h2>
    <ul class="post-list" style="margin-bottom: 40px;">
      {% for post in year_group.items %}
        <li class="post-item" style="padding: 15px 20px; margin-bottom: 10px;">
          <a href="{{ post.url | relative_url }}" class="post-item-link">
            <div style="display: flex; justify-content: space-between; align-items: baseline; flex-wrap: wrap;">
              <h3 class="post-item-title" style="font-size: 18px; margin: 0;">{{ post.title }}</h3>
              <span style="color: var(--amber-dim); font-size: 14px;">{{ post.date | date: "%d/%m/%Y" }}</span>
            </div>
            {% if post.categories %}
              <div class="post-item-categories" style="margin-top: 8px;">
                {% for category in post.categories %}
                  <span class="category-tag">{{ category }}</span>
                {% endfor %}
              </div>
            {% endif %}
          </a>
        </li>
      {% endfor %}
    </ul>
  {% endfor %}
</div>
