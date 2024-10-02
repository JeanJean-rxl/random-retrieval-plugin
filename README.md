# Obsidian Random Retrieval Plugin

**Note**: in the very early stage, NOT STABLE !!

This plugin was developped to open a random note based on local LLMs with Obsidian.
- Random for Random Note in Obsidian
- Retrieval for Retrieval Component in Haystack

I developped this plugin because .. I have a bad memory... and I enjoy the pleasure of treasure Hunt. While
- Search provides multiple way to reveal those sporadic ideas hidden in the vault,
- Random Note, as a core plugin, provides a complete random way to dig it out...

I choose LLM to be a retriver + ranker, so that this plugin can function like a fuzzy-search / half-random-note.

## Installation
- dependency: pip install hayhooks
- cd to plugin dir and run this:  uvicorn app:app --reload
- open plugin in obsidian, click ribbon button, and enjoy


## Future Plan
- multi-language support
- 1 search, N open
- speed up


## Version History
#### 1.0.0
- basic version: only support English for now.

