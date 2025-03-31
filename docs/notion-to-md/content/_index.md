---
title: Notion To MD - Use Your Notion Content Anywhere
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
  Turn Notion into your&nbsp;<br class="sm:hx-block hx-hidden" />ultimate content source
{{< /hextra/hero-headline >}}
</div>
<div class="hx-mb-12">
{{< hextra/hero-subtitle >}}
  💪 Powerful Notion conversion engine that lets you write once in Notion&nbsp;<br class="sm:hx-block hx-hidden" />and seamlessly publish anywhere, in any format. Exactly how you want it 😉
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
    title="Works with your favorite CMS"
    subtitle="Seamlessly feed your Notion content into WordPress, Webflow, Shopify or any other CMS without manual reformatting."
    class="hx-aspect-auto md:hx-aspect-[1.1/1] max-md:hx-min-h-[340px]"
    image="images/notion-cms.webp"
    imageClass="hx-top-[40%] hx-left-[24px] hx-w-[180%] sm:hx-w-[110%] dark:hx-opacity-80"
    style="background: radial-gradient(ellipse at 50% 80%,rgba(97,165,254,0.15),hsla(0,0%,100%,0));"
  >}}
  {{< hextra/feature-card
    title="Export everywhere at once"
    subtitle="Send your Notion content to your website, documentation, marketing materials, and more—all automatically."
    class="hx-aspect-auto md:hx-aspect-[1.1/1] max-lg:hx-min-h-[340px]"
    image="images/notion-publish.webp"
    imageClass="hx-top-[40%] hx-left-[36px] hx-w-[180%] sm:hx-w-[110%] dark:hx-opacity-80"
    style="background: radial-gradient(ellipse at 50% 80%,rgba(142,53,74,0.15),hsla(0,0%,100%,0));"
  >}}
  {{< hextra/feature-card
    title="Your content, your format"
    subtitle="Need Markdown? HTML? Something else entirely? You decide exactly how your Notion content should look."
    class="hx-aspect-auto md:hx-aspect-[1.1/1] max-md:hx-min-h-[340px]"
    image="images/notion-format.webp"
    imageClass="hx-top-[40%] hx-left-[36px] hx-w-[110%] sm:hx-w-[110%] dark:hx-opacity-80"
    style="background: radial-gradient(ellipse at 50% 80%,rgba(59,130,246,0.15),hsla(0,0%,100%,0));"
  >}}
  {{< hextra/feature-card
    title="Customize everything"
    subtitle="Make your content look exactly how you want it with simple customization options—no coding required."
    icon="plugin-icon"
  >}}
  {{< hextra/feature-card
    title="Images & files, handled automatically"
    subtitle="Stop worrying about broken images or missing files. We take care of moving everything where it needs to go."
    icon="media-icon"
  >}}
  {{< hextra/feature-card
    title="Simple setup, powerful results"
    subtitle="Get up and running in minutes with an intuitive setup that doesn't require a computer science degree."
    icon="builder-icon"
  >}}
  {{< hextra/feature-card
    title="Everything comes through perfectly"
    subtitle="Tables, images, code blocks, embeds—everything in your Notion page appears exactly as it should."
    icon="blocks-icon"
  >}}
  {{< hextra/feature-card
    title="Works with your existing tools"
    subtitle="Easily fits into your current workflow, whether you're using Next.js, WordPress, Hugo, or anything else."
    icon="integration-icon"
  >}}
{{< /hextra/feature-grid >}}
