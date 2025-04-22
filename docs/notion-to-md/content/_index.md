---
title: Notion To MD - Programmatic Notion Content Conversion
layout: hextra-home
---

<script src="https://cdn.tailwindcss.com"></script>
<script>
  tailwind.config = {
    darkMode: ['class', 'html[class~="dark"]']
  }
</script>

{{< hextra/hero-badge >}}

  <div class="hx-w-2 hx-h-2 hx-rounded-full hx-bg-primary-400"></div>
  <span>We are free & open-source!</span>
  {{< icon name="arrow-circle-right" attributes="height=14" >}}
{{< /hextra/hero-badge >}}

<div class="hx-mt-6 hx-mb-6">
{{< hextra/hero-headline >}}
  Programmatically Convert&nbsp;<br class="sm:hx-block hx-hidden" />Notion Pages to Markdown & More
{{< /hextra/hero-headline >}}
</div>
<div class="hx-mb-12">
{{< hextra/hero-subtitle >}}
  A flexible Node.js library to fetch and transform Notion pages&nbsp;<br class="sm:hx-block hx-hidden" />into Markdown, HTML, or custom formats via a powerful plugin system.
{{< /hextra/hero-subtitle >}}
</div>

<!-- Social Proof Section -->
<div class="flex flex-wrap justify-left md:justify-center gap-4 mb-12">
  <!-- GitHub Stars Badge (blue tint) -->
  <a href="https://github.com/souvikinator/notion-to-md" class="flex items-center px-4 py-2 rounded-full bg-blue-50/80 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-200/50 dark:border-blue-700/30 transition-all duration-200 hover:bg-blue-100/90 dark:hover:bg-blue-800/40 backdrop-blur-sm" target="_blank" rel="noopener noreferrer">
    {{< icon name="github" attributes="height=16 class='mr-2'" >}}
    <span class="font-semibold"><span id="github-stars">0</span> Stars</span>
  </a>
  
  <!-- NPM Downloads Badge (green tint) -->
  <a href="https://www.npmjs.com/package/notion-to-md" class="flex items-center px-4 py-2 rounded-full bg-green-50/80 dark:bg-green-900/30 text-green-700 dark:text-green-300 border border-green-200/50 dark:border-green-700/30 transition-all duration-200 hover:bg-green-100/90 dark:hover:bg-green-800/40 backdrop-blur-sm" target="_blank" rel="noopener noreferrer">
    {{< icon name="package" attributes="height=16 class='mr-2'" >}}
    <span class="font-semibold"><span id="npm-downloads">0</span> Weekly downloads</span>
  </a>
  
  <!-- Dependents Badge (purple tint) -->
  <a href="https://github.com/souvikinator/notion-to-md/network/dependents" class="flex items-center px-4 py-2 rounded-full bg-purple-50/80 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border border-purple-200/50 dark:border-purple-700/30 transition-all duration-200 hover:bg-purple-100/90 dark:hover:bg-purple-800/40 backdrop-blur-sm" target="_blank" rel="noopener noreferrer">
    {{< icon name="users" attributes="height=16 class='mr-2'" >}}
    <span class="font-semibold">Used by <span id="github-dependents">11.2k</span> repos</span>
  </a>

  <!-- Forks Badge (amber tint) -->
  <a href="https://github.com/souvikinator/notion-to-md/network/members" class="flex items-center px-4 py-2 rounded-full bg-amber-50/80 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border border-amber-200/50 dark:border-amber-700/30 transition-all duration-200 hover:bg-amber-100/90 dark:hover:bg-amber-800/40 backdrop-blur-sm" target="_blank" rel="noopener noreferrer">
    {{< icon name="git-fork" attributes="height=16 class='mr-2'" >}}
    <span class="font-semibold"><span id="github-forks">0</span> Forks</span>
  </a>
</div>

<div class="hx-mb-6">
{{< hextra/hero-button text="Get Started" link="docs/v4/getting-started/" >}}
</div>

<!-- Add JavaScript to fetch real data -->
<script>
document.addEventListener('DOMContentLoaded', async function() {
  // Set default values to prevent disappearing numbers
  document.getElementById('github-stars').textContent = '1.3k';
  document.getElementById('github-forks').textContent = '100';
  document.getElementById('npm-downloads').textContent = '60k+';
  
  try {
    // Fetch GitHub repo data (stars and forks)
    fetch('https://api.github.com/repos/souvikinator/notion-to-md')
      .then(response => {
        if (!response.ok) throw new Error('GitHub API rate limit exceeded');
        return response.json();
      })
      .then(data => {
        document.getElementById('github-stars').textContent = formatNumber(data.stargazers_count);
        document.getElementById('github-forks').textContent = formatNumber(data.forks_count);
      })
      .catch(error => console.warn('Error fetching GitHub data:', error));

    // Fetch npm weekly downloads
    fetch('https://api.npmjs.org/downloads/point/last-week/notion-to-md')
      .then(response => {
        if (!response.ok) throw new Error('NPM API rate limit exceeded');
        return response.json();
      })
      .then(data => {
        document.getElementById('npm-downloads').textContent = formatNumber(data.downloads);
      })
      .catch(error => console.warn('Error fetching NPM data:', error));
  } catch (error) {
    console.error('Error updating stats:', error);
  }

  // Helper function to format numbers
  function formatNumber(num) {
    if (!num || isNaN(num)) return '?';
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'k';
    return num;
  }
});
</script>

<div class="hx-mt-6"></div>
{{< hextra/feature-grid >}}
  {{< hextra/feature-card
    title="Integrate with Any System"
    subtitle="Flexible architecture allows integration with any CMS (WordPress, Webflow, etc.) or backend by handling content conversion and media processing."
    class="hx-aspect-auto md:hx-aspect-[1.1/1] max-md:hx-min-h-[340px]"
    style="background: radial-gradient(ellipse at 50% 80%,rgba(97,165,254,0.15),hsla(0,0%,100%,0));"
  >}}
  {{< hextra/feature-card
    title="Automate Publishing Workflows"
    subtitle="Build automated pipelines to publish Notion content to multiple destinations like static sites, documentation platforms, or databases."
    class="hx-aspect-auto md:hx-aspect-[1.1/1] max-lg:hx-min-h-[340px]"
    style="background: radial-gradient(ellipse at 50% 80%,rgba(142,53,74,0.15),hsla(0,0%,100%,0));"
  >}}
  {{< hextra/feature-card
    title="Customizable Output Formats"
    subtitle="Extensible plugin system allows transformation to Markdown, HTML, plain text, or completely custom output formats tailored to your needs."
    class="hx-aspect-auto md:hx-aspect-[1.1/1] max-md:hx-min-h-[340px]"
    style="background: radial-gradient(ellipse at 50% 80%,rgba(59,130,246,0.15),hsla(0,0%,100%,0));"
  >}}
  {{< hextra/feature-card
    title="Highly Configurable"
    subtitle="Tailor the conversion process with a rich plugin API and detailed configuration options for parsing, transformation, and media handling."
    icon="plugin-icon"
  >}}
  {{< hextra/feature-card
    title="Robust Media Handling"
    subtitle="Strategies to download, upload, or buffer Notion images and files, automatically updating links and managing cleanup."
    icon="media-icon"
  >}}
  {{< hextra/feature-card
    title="Developer-Friendly API"
    subtitle="Get started quickly with an intuitive API, while offering deep control and extensibility for complex use cases."
    icon="builder-icon"
  >}}
  {{< hextra/feature-card
    title="Accurate Block Conversion"
    subtitle="Parses and converts a wide range of Notion blocks, including text, lists, images, code blocks, callouts, databases, and more."
    icon="blocks-icon"
  >}}
  {{< hextra/feature-card
    title="Node.js Ecosystem Integration"
    subtitle="Integrates smoothly into Node.js build processes, static site generators (Next.js, Hugo, Eleventy), or any backend application."
    icon="integration-icon"
  >}}
{{< /hextra/feature-grid >}}
