import { App, CachedMetadata } from 'obsidian';
import { TagFilesMap } from './types';
import { execSync } from 'child_process';


export function getTagFilesMap(app: App): TagFilesMap {
    const metadataCache = app.metadataCache;
    const markdownFiles = app.vault.getMarkdownFiles();

    const tagFilesMap: TagFilesMap = {};

    for (const markdownFile of markdownFiles) {
        const cachedMetadata = metadataCache.getFileCache(markdownFile);

        if (cachedMetadata) {
            const cachedTags = getCachedTags(cachedMetadata);
            if (cachedTags.length) {
                for (const cachedTag of cachedTags) {
                    if (tagFilesMap[cachedTag]) {
                        tagFilesMap[cachedTag].push(markdownFile);
                    } else {
                        tagFilesMap[cachedTag] = [markdownFile];
                    }
                }
            }
        }
    }

    return tagFilesMap;
}

function getCachedTags(cachedMetadata: CachedMetadata): string[] {
    const bodyTags: string[] = cachedMetadata.tags?.map((x) => x.tag) || [];
    const frontMatterTags: string[] = cachedMetadata.frontmatter?.tags || [];

    // frontmatter tags might not have a hashtag in front of them
    const cachedTags = bodyTags.concat(frontMatterTags).map((x) => (x.startsWith('#') ? x : '#' + x));

    return cachedTags;
}


export function randomElement<T>(array: T[]): T {
    const pythonPath = '/Users/yeyous/miniforge3/envs/testtypescript/bin/python'; 
    const scriptPath = '/Users/yeyous/Documents/idea/rr-3/.obsidian/plugins/random-retrieval-plugin/src/test.py';

    const index = execSync(`${pythonPath} ${scriptPath} ${array.length}`).toString().trim();

    return array[parseInt(index, 10)];

}
