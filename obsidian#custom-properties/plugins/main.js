// main.js
/* global require, module */
const Ob = require('obsidian');
const Plugin = Ob.Plugin;
const Menu = Ob.Menu;
const Notice = Ob.Notice;

// Category Configuration - Edit these values to change category names
const CATEGORIES = {
  '0': 'Master',
  '1': 'Game Architecture', 
  '2': 'Narrative Design',
  '3': 'Visual Design',
  '4': 'Audio Design',
  '5': 'Technical Development',
  '6': 'Library',
  '7': 'Quality Assurance',
  '8': 'Marketing & Communications',
  '9': 'Legal & Publishing'
};

const CATEGORY_VALUES = Object.values(CATEGORIES).concat(['Unknown']);

module.exports = class CustomPropertiesMain extends Plugin {
  async onload() {
    await this.loadSettings();
    this.hub = this.createHub();
    
    // Create plugin guide on first load
    await this.createPluginGuide();

    // Template triggers
    this.registerEvent(this.app.vault.on("modify", async (file) => {
      if (file.extension !== "md") return;
      const content = await this.app.vault.read(file);
      const firstLine = content.split('\n')[0];
      
      if (firstLine === '--ccprop') { // ccprop = "child custom property"
        await this.applyTemplateAndCleanup(file, 'child');
      } else if (firstLine === '--pcprop') { // pcprop = "parent custom property"
        await this.applyTemplateAndCleanup(file, 'parent');
      }
    }));
    

    
    // Auto-apply template when renaming to XX_ pattern
    this.registerEvent(this.app.vault.on("rename", async (file, oldPath) => {
      if (file.extension !== "md") return;
      const oldName = oldPath.split('/').pop().replace('.md', '');
      const newName = file.basename;
      
      // Check if renamed TO XX_ pattern (and wasn't XX_ before)
      const oldMatch = oldName.match(/^\d\d_/);
      const newMatch = newName.match(/^\d\d_/);
      
      if (newMatch && !oldMatch) {
        setTimeout(async () => {
          try {
            const content = await this.app.vault.read(file);
            // Only apply if file is empty or has no frontmatter
            if (!content.trim() || !content.startsWith('---')) {
              await this.applyTemplateToFile(file);
            }
          } catch (e) {
            console.error('Error applying template:', e);
          }
        }, 200);
      } else if (newMatch && oldMatch) {
        // Handle existing XX_ rename (update template)
        await this.updateTemplateOnRename(file);
        

      }
    }));
    
    // Command to manually apply template
    this.addCommand({
      id: "apply-template",
      name: "Apply template to current note",
      callback: async () => {
        const file = this.app.workspace.getActiveFile();
        if (!file || file.extension !== "md") { 
          return; 
        }
        await this.app.fileManager.processFrontMatter(file, (fm) => {
          const template = this.getTemplate(file);
          for (const k of Object.keys(template)) {
            if (fm[k] === undefined) fm[k] = template[k];
          }
        });
        await this.saveData(this.settings);
        setTimeout(() => this.paintAll(), 100);
      }
    });
    
    // Auto-refresh properties every 5 minutes
    this.refreshInterval = setInterval(() => {
      // Clear all applied flags
      document.querySelectorAll('.metadata-property-value').forEach(el => {
        delete el.dataset.statusApplied;
        delete el.dataset.authorApplied;
        delete el.dataset.versionProtected;
        delete el.dataset.parentApplied;
        delete el.dataset.typeApplied;
        delete el.dataset.idApplied;
        delete el.dataset.lastupdateApplied;
        delete el.dataset.tagsApplied;
        delete el.dataset.childApplied;
        delete el.dataset.categoryApplied;
      });
      
      // Force repaint
      setTimeout(() => this.paintAll(), 100);
    }, 5 * 60 * 1000); // 5 minutes
    
    // Auto-update all XX_ notes on first load
    this.app.workspace.onLayoutReady(() => {
      setTimeout(() => this.updateAllNotes(), 1000);
    });

    this.registerEvent(this.app.workspace.on("layout-change", () => this.paintAll()));
    this.registerEvent(this.app.workspace.on("active-leaf-change", () => this.paintAll()));
    this.registerEvent(this.app.metadataCache.on("changed", (f) => {
      const af = this.app.workspace.getActiveFile();
      if (af && f.path === af.path) {
        setTimeout(() => this.paintAll(), 50);
      }
    }));
    
    // Listen for keydown events to update Last Update property
    this.registerDomEvent(document, 'keydown', (evt) => {
      const file = this.app.workspace.getActiveFile();
      if (file && evt.target.closest('.cm-editor')) {
        clearTimeout(this.lastUpdateTimeout);
        this.lastUpdateTimeout = setTimeout(() => {
          this.updateLastUpdateProperty(file);
        }, 1000);
      }
    });
    
    this.propertyObserver = new MutationObserver(() => {
      setTimeout(() => this.attachIconMenus(), 10);
    });
    
    this.app.workspace.onLayoutReady(() => {
      this.paintAll();
      const container = document.querySelector('.workspace');
      if (container) {
        this.propertyObserver.observe(container, { childList: true, subtree: true });
      }
    });
  }

  async loadSettings() {
    try {
      const data = await this.loadData();
      this.settings = data || { map: {} };
      
      // Ensure settings structure is valid
      if (!this.settings.map) {
        this.settings.map = {};
      }
      
      await this.loadTagColors();
    } catch (error) {
      console.error('Error loading settings:', error);
      this.settings = { map: {} };
    }
  }
  
  async updateAllNotes() {
    const files = this.app.vault.getMarkdownFiles().filter(f => f.basename.match(/^\d\d_/));
    if (files.length === 0) return;
    
    const validTypes = ['id', 'type', 'category', 'parent', 'child', 'tags', 'author', 'version', 'last update', 'status'];
    let updated = 0;
    
    for (const file of files) {
      const cache = this.app.metadataCache.getFileCache(file);
      if (!cache?.frontmatter) continue;
      
      const match = file.basename.match(/^(\d)(\d)_/);
      if (!match) continue;
      
      const isParent = match[2] === '0';
      const category = CATEGORIES[match[1]] || 'Unknown';
      
      // Template order for parent/child
      const templateOrder = isParent 
        ? ['id', 'type', 'category', 'child', 'tags', 'author', 'version', 'last update', 'status']
        : ['id', 'type', 'category', 'parent', 'tags', 'author', 'version', 'last update', 'status'];
      
      const defaults = {
        id: file.basename.replace(/^\d\d_/, ''),
        type: isParent ? 'Parent' : 'Child',
        category: category,
        child: 'auto-detected',
        parent: 'auto-detected',
        tags: [],
        author: '',
        version: '0.0.1',
        'last update': (() => {
          const now = new Date();
          const day = String(now.getDate()).padStart(2, '0');
          const month = String(now.getMonth() + 1).padStart(2, '0');
          const year = now.getFullYear();
          return `${day}/${month}/${year}`;
        })(),
        status: '🔴'
      };
      
      // Check if reordering/cleanup needed
      const currentProps = Object.keys(cache.frontmatter);
      const validCurrentProps = currentProps.filter(key => validTypes.includes(key) || this.settings?.map?.[key]);
      const invalidProps = currentProps.filter(key => !validTypes.includes(key) && !this.settings?.map?.[key]);
      const missingProps = templateOrder.filter(key => !currentProps.includes(key));
      
      if (missingProps.length > 0 || invalidProps.length > 0 || !this.arraysEqual(validCurrentProps, templateOrder.filter(key => currentProps.includes(key)))) {
        await this.app.fileManager.processFrontMatter(file, (fm) => {
          // Preserve existing values
          const preserved = {};
          for (const key of templateOrder) {
            if (fm[key] !== undefined) {
              preserved[key] = fm[key];
            } else if (defaults[key] !== undefined) {
              preserved[key] = defaults[key];
            }
          }
          
          // Clear and rebuild in correct order
          Object.keys(fm).forEach(key => delete fm[key]);
          Object.assign(fm, preserved);
        });
        
        // Update mappings
        this.settings.map = { ...this.settings.map };
        for (const key of templateOrder) {
          if (validTypes.includes(key)) {
            this.settings.map[key] = key === 'last update' ? 'last update' : key;
          }
        }
        
        updated++;
      }
    }
    
    if (updated > 0) {
      await this.saveData(this.settings);
      setTimeout(() => this.paintAll(), 500);
    }
  }
  
  arraysEqual(a, b) {
    return a.length === b.length && a.every((val, i) => val === b[i]);
  }
  
  async applyTemplateToFile(file) {
    const match = file.basename.match(/^(\d)(\d)_/);
    if (!match) return;
    
    const isParent = match[2] === '0';
    const templateType = isParent ? 'parent' : 'child';
    const now = new Date();
    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const year = now.getFullYear();
    const dateStr = `${day}/${month}/${year}`;
    
    // Create proper frontmatter structure
    const frontmatterLines = ['---'];
    
    if (isParent) {
      const match = file.basename.match(/^(\d)/);
      const categories = {
        '0': 'Executive Assistant', '1': 'Game Architecture', '2': 'Narrative', '3': 'Visual Design', '4': 'Audio Design',
        '5': 'Technical Development', '6': 'Documentation', '7': 'Quality Assurance', '8': 'Marketing', '9': 'Legal & Publishing'
      };
      const category = match ? (categories[match[1]] || 'Unknown') : 'Unknown';
      
      this.settings.map = {
        ...this.settings.map,
        id: 'id', type: 'type', category: 'category', child: 'child', tags: 'tags', author: 'author',
        version: 'version', 'last update': 'last update', status: 'status'
      };
      frontmatterLines.push(`id: "${file.basename.replace(/^\d\d_/, '')}"`); 
      frontmatterLines.push(`type: "Parent"`);
      frontmatterLines.push(`category: "${category}"`);
      frontmatterLines.push(`child: "auto-detected"`);
      frontmatterLines.push(`tags: []`);
      frontmatterLines.push(`author: ""`);
      frontmatterLines.push(`version: "0.0.1"`);
      frontmatterLines.push(`last update: "${dateStr}"`);
      frontmatterLines.push(`status: "🔴"`);
    } else {
      const match = file.basename.match(/^(\d)/);
      const categories = {
        '0': 'Foundation', '1': 'Architecture', '2': 'Narration', '3': 'Art Direction', '4': 'Audio',
        '5': 'Code Engineering', '6': 'Library', '7': 'Production', '8': 'Communications', '9': 'Legal'
      };
      const category = match ? (categories[match[1]] || 'Unknown') : 'Unknown';
      
      this.settings.map = {
        ...this.settings.map,
        id: 'id', type: 'type', category: 'category', parent: 'parent', tags: 'tags', author: 'author',
        version: 'version', 'last update': 'last update', status: 'status'
      };
      frontmatterLines.push(`id: "${file.basename.replace(/^\d\d_/, '')}"`); 
      frontmatterLines.push(`type: "Child"`);
      frontmatterLines.push(`category: "${category}"`);
      frontmatterLines.push(`parent: "auto-detected"`);
      frontmatterLines.push(`tags: []`);
      frontmatterLines.push(`author: ""`);
      frontmatterLines.push(`version: "0.0.1"`);
      frontmatterLines.push(`last update: "${dateStr}"`);
      frontmatterLines.push(`status: "🔴"`);
    }
    
    frontmatterLines.push('---');
    const frontmatter = frontmatterLines.join('\n') + '\n\n';
    
    await this.app.vault.modify(file, frontmatter);
    await this.saveData(this.settings);
    setTimeout(() => this.paintAll(), 200);
  }
  
  async applyTemplateAndCleanup(file, forceType = null) {
    const match = file.basename.match(/^(\d)(\d)_/);
    let isParent;
    let templateType;
    
    if (forceType) {
      // Use forced template type (from --ccprop or --pcprop)
      isParent = forceType === 'parent';
      templateType = forceType;
    } else {
      // Auto-detect from filename (legacy --cprop behavior)
      isParent = match ? match[2] === '0' : false;
      templateType = isParent ? 'parent' : 'child';
    }
    
    const now = new Date();
    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const year = now.getFullYear();
    const dateStr = `${day}/${month}/${year}`;
    
    let template;
    if (isParent) {
      this.settings.map = {
        ...this.settings.map,
        id: 'id', type: 'type', child: 'child', tags: 'tags', author: 'author',
        version: 'version', 'last update': 'last update', status: 'status'
      };
      template = {
        id: file.basename, type: 'Parent', child: 'auto-detected', tags: [], author: '',
        version: '0.0.1', 'last update': dateStr, status: '🔴'
      };
    } else {
      const parents = this.getParentsForChild(file.basename);
      const parentName = parents.join(', ');
      
      this.settings.map = {
        ...this.settings.map,
        id: 'id', type: 'type', parent: 'parent', tags: 'tags', author: 'author',
        version: 'version', 'last update': 'last update', status: 'status'
      };
      template = {
        id: file.basename, type: 'Child', parent: parentName, tags: [], author: '',
        version: '0.0.1', 'last update': dateStr, status: '🔴'
      };
    }
    
    // Get current content and remove trigger line
    const content = await this.app.vault.read(file);
    const lines = content.split('\n');
    lines.shift(); // Remove first line with trigger
    const newContent = lines.join('\n');
    
    // Create proper frontmatter structure
    const frontmatterLines = ['---'];
    for (const [key, value] of Object.entries(template)) {
      if (Array.isArray(value)) {
        frontmatterLines.push(`${key}: []`);
      } else if (typeof value === 'string') {
        frontmatterLines.push(`${key}: "${value}"`);
      } else {
        frontmatterLines.push(`${key}: ${value}`);
      }
    }
    frontmatterLines.push('---');
    
    const finalContent = frontmatterLines.join('\n') + '\n' + newContent;
    await this.app.vault.modify(file, finalContent);
    
    await this.saveData(this.settings);
    setTimeout(() => this.paintAll(), 200);
  }
  

  
  async updateTemplateOnRename(file) {
    const cache = this.app.metadataCache.getFileCache(file);
    if (!cache?.frontmatter) return;
    
    const match = file.basename.match(/^(\d)(\d)_/);
    const isParent = match ? match[2] === '0' : false;
    
    await this.app.fileManager.processFrontMatter(file, (fm) => {
      if (isParent) {
        // Converting to parent - rebuild in parent order
        const match = file.basename.match(/^(\d)/);
        const categories = {
          '0': 'Foundation', '1': 'Architecture', '2': 'Narration', '3': 'Art Direction', '4': 'Audio',
          '5': 'Code Engineering', '6': 'Library', '7': 'Production', '8': 'Communications', '9': 'Legal'
        };
        const category = match ? (categories[match[1]] || 'Unknown') : 'Unknown';
        
        const newFm = {
          id: file.basename.replace(/^\d\d_/, ''),
          type: 'Parent',
          category: category,
          child: 'auto-detected',
          tags: fm.tags || [],
          author: fm.author || '',
          version: fm.version || '0.0.1',
          'last update': fm['last update'] || '',
          status: fm.status || '🔴'
        };
        Object.keys(fm).forEach(key => delete fm[key]);
        Object.assign(fm, newFm);
      } else {
        // Converting to child - rebuild in child order
        const match = file.basename.match(/^(\d)/);
        const categories = {
          '0': 'Foundation', '1': 'Architecture', '2': 'Narration', '3': 'Art Direction', '4': 'Audio',
          '5': 'Code Engineering', '6': 'Library', '7': 'Production', '8': 'Communications', '9': 'Legal'
        };
        const category = match ? (categories[match[1]] || 'Unknown') : 'Unknown';
        
        const newFm = {
          id: file.basename.replace(/^\d\d_/, ''),
          type: 'Child',
          category: category,
          parent: 'auto-detected',
          tags: fm.tags || [],
          author: fm.author || '',
          version: fm.version || '0.0.1',
          'last update': fm['last update'] || '',
          status: fm.status || '🔴'
        };
        Object.keys(fm).forEach(key => delete fm[key]);
        Object.assign(fm, newFm);
      }
    });
    
    // Update property mappings
    if (this.settings?.map) {
      if (isParent) {
        delete this.settings.map.parent;
        this.settings.map.child = 'child';
      } else {
        delete this.settings.map.child;
        this.settings.map.parent = 'parent';
      }
    }
    
    await this.saveData(this.settings);
    setTimeout(() => this.paintAll(), 100);
  }
  
  getTemplate(file) {
    // Keep for manual command
    const match = file.basename.match(/^(\d)(\d)_/);
    if (!match) return {};
    
    const [, first, second] = match;
    const isParent = second === '0';
    
    const now = new Date();
    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const year = now.getFullYear();
    const dateStr = `${day}/${month}/${year}`;
    
    if (isParent) {
      this.settings.map = {
        ...this.settings.map,
        id: 'id', type: 'type', tags: 'tags', author: 'author',
        version: 'version', 'last update': 'last update', status: 'status'
      };
      return {
        id: file.basename, type: 'Parent', child: 'auto-detected', tags: [], author: '',
        version: '0.0.1', 'last update': dateStr, status: '🔴'
      };
    } else {
      const parents = this.getParentsForChild(file.basename);
      const parentName = parents.join(', ');
      
      this.settings.map = {
        ...this.settings.map,
        id: 'id', type: 'type', parent: 'parent', tags: 'tags', author: 'author',
        version: 'version', 'last update': 'last update', status: 'status'
      };
      return {
        id: file.basename, type: 'Child', parent: parentName, tags: [], author: '',
        version: '0.0.1', 'last update': dateStr, status: '🔴'
      };
    }
  }
  
  generateUniquePropertyName(baseName) {
    const file = this.app.workspace.getActiveFile();
    if (!file) return baseName;
    
    const cache = this.app.metadataCache.getFileCache(file);
    const existingProps = cache?.frontmatter ? Object.keys(cache.frontmatter) : [];
    
    if (!existingProps.includes(baseName)) {
      return baseName;
    }
    
    let counter = 1;
    let newName = `${baseName}${counter}`;
    while (existingProps.includes(newName)) {
      counter++;
      newName = `${baseName}${counter}`;
    }
    return newName;
  }

  paintAll() {
    // Check if any tag inputs have unsaved text
    const hasUnsavedInput = Array.from(document.querySelectorAll('.pl-tags-wrap input')).some(input => 
      input.value.trim().length > 0
    );
    
    // Skip repaint if there's unsaved input to prevent text deletion
    if (hasUnsavedInput) {
      return;
    }
    
    // Ensure settings exist
    if (!this.settings || !this.settings.map) {
      this.settings = { map: {} };
    }
    
    this.detectRenames();
    this.autoDetectChildProperties();
    this.attachIconMenus();
    
    // Add error handling for property application
    document.querySelectorAll('.metadata-property').forEach((row) => {
      try {
        const key = row.getAttribute('data-property-key');
        const type = this.settings.map[key];
        if (type) {
          // Clear duplicate prevention flags to allow reapplication
          const valEl = row.querySelector('.metadata-property-value');
          if (valEl) {
            delete valEl.dataset.statusApplied;
            delete valEl.dataset.authorApplied;
            delete valEl.dataset.versionProtected;
            delete valEl.dataset.parentApplied;
            delete valEl.dataset.typeApplied;
            delete valEl.dataset.idApplied;
            delete valEl.dataset.lastupdateApplied;
            delete valEl.dataset.tagsApplied;
            delete valEl.dataset.childApplied;
            delete valEl.dataset.categoryApplied;
          }
          this.applyCustomType(row, type);
        }
      } catch (error) {
        console.error('Error applying custom type to property:', error);
      }
    });
  }
  
  autoDetectChildProperties() {
    const file = this.app.workspace.getActiveFile();
    if (!file) return;
    
    const match = file.basename.match(/^(\d)(\d)_/);
    const cache = this.app.metadataCache.getFileCache(file);
    if (!cache?.frontmatter) return;
    
    const isParent = match && match[2] === '0';
    const isChild = match && match[2] !== '0';
    
    // Clean up incorrect mappings first
    let needsSave = false;
    
    for (const key of Object.keys(cache.frontmatter)) {
      if (isParent) {
        // Parent file should have 'child' property, not 'parent'
        if (key.toLowerCase() === 'child' && this.settings.map[key] !== 'child') {
          this.settings.map[key] = 'child';
          needsSave = true;
        }
        if (key.toLowerCase() === 'parent' && this.settings.map[key] === 'parent') {
          delete this.settings.map[key];
          needsSave = true;
        }
      } else if (isChild) {
        // Child file should have 'parent' property, not 'child'
        if (key.toLowerCase() === 'parent' && this.settings.map[key] !== 'parent') {
          this.settings.map[key] = 'parent';
          needsSave = true;
        }
        if (key.toLowerCase() === 'child' && this.settings.map[key] === 'child') {
          delete this.settings.map[key];
          needsSave = true;
        }
      }
      
      // Ensure other properties keep their correct mappings
      if (key.toLowerCase() === 'last update' && this.settings.map[key] !== 'last update') {
        this.settings.map[key] = 'last update';
        needsSave = true;
      }
    }
    
    if (needsSave) {
      this.saveData(this.settings);
    }
  }
  
  detectRenames() {
    if (!this.settings || !this.settings.map) return;
    
    const file = this.app.workspace.getActiveFile();
    if (!file) return;
    
    const cache = this.app.metadataCache.getFileCache(file);
    const currentProps = cache?.frontmatter ? Object.keys(cache.frontmatter) : [];
    const mappedProps = Object.keys(this.settings.map);
    
    // Find orphaned mappings (properties that no longer exist)
    const orphanedMappings = mappedProps.filter(prop => !currentProps.includes(prop));
    
    if (orphanedMappings.length === 0) return;
    
    // For each orphaned mapping, try to find a property with matching custom type value
    for (const orphanedProp of orphanedMappings) {
      const orphanedType = this.settings.map[orphanedProp];
      
      // Find properties without mappings that might be the renamed version
      const unmappedProps = currentProps.filter(prop => !this.settings.map[prop]);
      
      for (const unmappedProp of unmappedProps) {
        const value = cache.frontmatter[unmappedProp];
        
        // Check if this property has a value that matches the orphaned type
        const isMatchingType = this.valueMatchesType(value, orphanedType);
        
        if (isMatchingType) {
          // Transfer the mapping
          this.settings.map[unmappedProp] = orphanedType;
          delete this.settings.map[orphanedProp];
          this.saveData(this.settings);
          break; // Only transfer to first match
        }
      }
    }
    
    // Clean up any remaining orphaned mappings
    let cleaned = false;
    for (const orphanedProp of orphanedMappings) {
      if (!currentProps.includes(orphanedProp)) {
        delete this.settings.map[orphanedProp];
        cleaned = true;
      }
    }
    
    if (cleaned) {
      this.saveData(this.settings);
    }
  }
  
  valueMatchesType(value, type) {
    const module = this.hub.customTypes.find(m => m.label.toLowerCase() === type);
    if (module && module.valueMatchesType) {
      return module.valueMatchesType(value);
    }
    return false;
  }

  applyCustomType(row, type) {
    if (type === 'status') {
      this.applyStatusType(row);
    } else if (type === 'version') {
      this.applyVersionType(row);
    } else if (type === 'author') {
      this.applyAuthorType(row);
    } else if (type === 'parent') {
      this.applyParentType(row);
    } else if (type === 'type') {
      this.applyTypeType(row);
    } else if (type === 'id') {
      this.applyIdType(row);
    } else if (type === 'lastupdate' || type === 'last update') {
      this.applyLastUpdateType(row);
    } else if (type === 'tags') {
      this.applyTagsType(row);
    } else if (type === 'child') {
      this.applyChildType(row);
    } else if (type === 'category') {
      this.applyCategoryType(row);
    }
  }
  
  applyCategoryType(row) {
    row.setAttribute('data-pl-type', 'category');
    const key = row.getAttribute('data-property-key');
    const valEl = row.querySelector('.metadata-property-value');
    if (!valEl) return;

    if (valEl.dataset.categoryApplied === 'true') return;
    valEl.dataset.categoryApplied = 'true';

    const file = this.app.workspace.getActiveFile();
    if (!file) return;
    
    // Auto-detect category based on first digit of filename
    const match = file.basename.match(/^(\d)/);
    let category = 'Unknown';
    
    if (match) {
      const categories = {
        ...CATEGORIES
      };
      category = categories[match[1]] || 'Unknown';
    }

    // Automatically update the frontmatter
    this.app.fileManager.processFrontMatter(file, (fm) => { fm[key] = category; });

    valEl.setAttribute('contenteditable', 'false');
    valEl.style.userSelect = 'none';
    valEl.style.cursor = 'default';
    valEl.textContent = category;
    valEl.title = 'Auto-detected category based on first digit';
  }

  applyStatusType(row) {
    row.setAttribute('data-pl-type', 'status');
    const key = row.getAttribute('data-property-key');
    const valEl = row.querySelector('.metadata-property-value');
    if (!valEl) return;

    // Skip if already applied to prevent duplicate event listeners
    if (valEl.dataset.statusApplied === 'true') return;
    valEl.dataset.statusApplied = 'true';

    const file = this.app.workspace.getActiveFile();
    if (!file) return;
    
    const cache = this.app.metadataCache.getFileCache(file);
    let current = cache?.frontmatter?.[key] || '';
    
    // Normalize words to emoji
    if (current === 'Complete') current = '🟢';
    else if (current === 'Draft') current = '🟡';
    else if (current === 'Incomplete') current = '🔴';
    else if (current === 'Testing') current = '🔵';
    else if (current === 'Deprecated') current = '⚪';

    // Set status color attribute
    if (current === '🟢') row.setAttribute('data-pl-status', 'green');
    else if (current === '🟡') row.setAttribute('data-pl-status', 'yellow');
    else if (current === '🔴') row.setAttribute('data-pl-status', 'red');
    else if (current === '🔵') row.setAttribute('data-pl-status', 'blue');
    else if (current === '⚪') row.setAttribute('data-pl-status', 'white');

    // Lock field and build custom UI
    valEl.setAttribute('contenteditable', 'false');
    valEl.style.userSelect = 'none';
    valEl.style.cursor = 'default';
    valEl.onkeydown = (e) => { e.preventDefault(); e.stopPropagation(); };

    valEl.textContent = '';
    const wrap = document.createElement('span');
    wrap.className = 'pl-status-wrap';
    wrap.style.display = 'inline-flex';
    wrap.style.alignItems = 'center';
    wrap.style.gap = '6px';

    const pill = document.createElement('span');
    pill.className = 'pl-status-emoji';
    pill.style.fontSize = '1em';
    pill.textContent = ['🟢', '🟡', '🔴', '🔵', '⚪'].includes(current) ? current : '—';

    const btn = document.createElement('button');
    btn.textContent = '▾';
    btn.title = 'Change status';
    Object.assign(btn.style, {
      border: 'none',
      background: 'transparent',
      cursor: 'pointer',
      padding: '0',
      lineHeight: '1',
      fontSize: '0.9em'
    });

    btn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const menu = new Menu(this.app);
      const opts = [
        { emoji: '🟢', label: 'Complete' },
        { emoji: '🟡', label: 'Draft' },
        { emoji: '🔴', label: 'Incomplete' },
        { emoji: '🔵', label: 'Testing' },
        { emoji: '⚪', label: 'Deprecated' }
      ];
      for (const o of opts) {
        menu.addItem(i => i.setTitle(`${o.emoji} ${o.label}`).onClick(async () => {
          await this.app.fileManager.processFrontMatter(file, (fm) => { fm[key] = o.emoji; });
          pill.textContent = o.emoji;
          let state = 'green';
          if (o.emoji === '🟢') state = 'green';
          else if (o.emoji === '🟡') state = 'yellow';
          else if (o.emoji === '🔴') state = 'red';
          else if (o.emoji === '🔵') state = 'blue';
          else if (o.emoji === '⚪') state = 'white';
          row.setAttribute('data-pl-status', state);

        }));
      }
      const r = btn.getBoundingClientRect();
      menu.showAtPosition({ x: r.left, y: r.bottom + 4 });
    });

    wrap.appendChild(pill);
    wrap.appendChild(btn);
    valEl.appendChild(wrap);
  }

  applyVersionType(row, forceVal) {
    row.setAttribute('data-pl-type', 'version');
    const key = row.getAttribute('data-property-key');
    const valEl = row.querySelector('.metadata-property-value');
    if (!valEl) return;

    const file = this.app.workspace.getActiveFile();
    if (!file) return;
    
    const cache = this.app.metadataCache.getFileCache(file);
    const current = (forceVal ?? (cache?.frontmatter?.[key] || '0.1.0')).toString();

    // Initialize lock state storage
    if (!this.versionLocks) this.versionLocks = {};
    const lockKey = `${file.path}:${key}`;
    const isLocked = this.versionLocks[lockKey] || false;

    // lock field
    valEl.setAttribute("contenteditable", "false");
    valEl.style.userSelect = "none";
    valEl.style.cursor = "default";
    valEl.onkeydown = (e) => { e.preventDefault(); e.stopPropagation(); };

    // rebuild UI every time (handles Obsidian re-render)
    valEl.textContent = "";
    const wrap = document.createElement('span');
    wrap.className = 'vp-wrap';
    wrap.style.display = "inline-flex";
    wrap.style.alignItems = "center";
    wrap.style.gap = "4px";
    wrap.style.fontVariantNumeric = "tabular-nums";
    valEl.appendChild(wrap);

    const mkSeg = (kind, title) => {
      const seg = document.createElement('span');
      seg.className = 'vp-seg';
      seg.dataset.kind = kind;
      seg.style.padding = "0 2px";
      seg.style.borderRadius = "4px";
      seg.style.cursor = isLocked ? "default" : "ns-resize";
      seg.title = isLocked ? "Version locked" : `${title} — scroll to change`;
      seg.style.opacity = isLocked ? "0.6" : "1";

      // wheel → bump that segment (with carry) - only if not locked
      seg.addEventListener('wheel', (e) => {
        if (isLocked) return;
        e.preventDefault(); e.stopPropagation();
        const dir = e.deltaY < 0 ? +1 : -1;
        const next = this.bumpSeg(wrap.dataset.value, kind, dir);
        
        this.writeVersionStandalone(key, next);
      }, { passive: false });

      const num = document.createElement('span');
      num.className = 'vp-num';
      seg.appendChild(num);
      return seg;
    };

    const dot = () => {
      const d = document.createElement('span');
      d.textContent = ".";
      d.className = "vp-dot";
      d.style.opacity = "0.9";
      return d;
    };

    const segMaj = mkSeg("maj", "major");
    const segMin = mkSeg("min", "minor");
    const segPat = mkSeg("pat", "patch");
    wrap.appendChild(segMaj);
    wrap.appendChild(dot());
    wrap.appendChild(segMin);
    wrap.appendChild(dot());
    wrap.appendChild(segPat);

    // Add lock icon
    const lockIcon = document.createElement('span');
    lockIcon.className = isLocked ? 'vp-lock vp-lock-locked' : 'vp-lock vp-lock-unlocked';
    lockIcon.innerHTML = isLocked 
      ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>'
      : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 9.9-1"/></svg>';
    lockIcon.title = isLocked ? 'Click to unlock version editing' : 'Click to lock version editing';
    
    lockIcon.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.versionLocks[lockKey] = !isLocked;
      setTimeout(() => this.paintAll(), 50);
    });
    
    wrap.appendChild(lockIcon);

    // paint values
    const v = this.parseSemver(current);
    wrap.dataset.value = this.fmt(v);
    const nums = wrap.querySelectorAll('.vp-seg .vp-num');
    nums[0].textContent = String(v.maj);
    nums[1].textContent = String(v.min);
    nums[2].textContent = String(v.pat);
  }
  
  parseSemver(s) {
    s = (s || "").trim();
    const m = s.match(/^([vV]?)(\d+)\.(\d+)\.(\d+)$/);
    if (!m) return { prefix: "", maj: 0, min: 1, pat: 0 };
    return { prefix: m[1] || "", maj: +m[2], min: +m[3], pat: +m[4] };
  }
  
  fmt(v) {
    return `${v.prefix}${v.maj}.${v.min}.${v.pat}`;
  }
  
  clamp0(n) {
    return Math.max(0, Math.trunc(n || 0));
  }
  
  add10(val, delta, preventCarry = false) {
    let n = (val | 0) + (delta | 0), carry = 0;
    while (n > 9) { n -= 10; carry++; }
    while (n < 0) { n += 10; carry--; }
    if (preventCarry) carry = 0;
    return { n, carry };
  }
  
  bumpSeg(curStr, seg, dir) {
    const v = this.parseSemver(curStr);
    let { maj, min, pat } = v;
    
    if (seg === "pat") {
      let r = this.add10(pat, dir); pat = r.n;
      r = this.add10(min, r.carry); min = r.n;
      maj = this.clamp0(maj + r.carry);
    } else if (seg === "min") {
      // If major is 0 and trying to go below 0, prevent it
      if (maj === 0 && min === 0 && dir < 0) {
        return this.fmt(v); // Return unchanged
      }
      let r = this.add10(min, dir); min = r.n;
      maj = this.clamp0(maj + r.carry);
    } else {
      maj = this.clamp0(maj + dir);
    }
    
    // Prevent version from going below 0.0.1
    if (maj === 0 && min === 0 && pat === 0) {
      pat = 1;
    }
    
    v.maj = maj; v.min = min; v.pat = pat;
    return this.fmt(v);
  }
  
  async writeVersionStandalone(key, next) {
    const f = this.app.workspace.getActiveFile();
    if (!f) return;
    
    // Ensure the property stays mapped as version type
    if (!this.settings) this.settings = { map: {} };
    this.settings.map[key] = 'version';
    
    await this.app.fileManager.processFrontMatter(f, fm => { fm[key] = next; });
    await this.saveData(this.settings);
    
    // defer repaint past the DOM refresh
    requestAnimationFrame(() => requestAnimationFrame(() => {
      document.querySelectorAll('.metadata-property').forEach((row) => {
        if (row.getAttribute('data-property-key') === key && this.settings.map[key] === 'version') {
          this.applyVersionType(row, next);
        }
      });
    }));
  }

  getAllAuthors() {
    const authors = new Set();
    const files = this.app.vault.getMarkdownFiles();
    for (const file of files) {
      const cache = this.app.metadataCache.getFileCache(file);
      if (cache?.frontmatter) {
        for (const [prop, value] of Object.entries(cache.frontmatter)) {
          if (this.settings.map[prop] === 'author' && value && typeof value === 'string') {
            authors.add(value.trim());
          }
        }
      }
    }
    return Array.from(authors).sort();
  }

  applyAuthorType(row) {
    row.setAttribute('data-pl-type', 'author');
    const key = row.getAttribute('data-property-key');
    const valEl = row.querySelector('.metadata-property-value');
    if (!valEl) return;

    if (valEl.dataset.authorApplied === 'true') return;
    valEl.dataset.authorApplied = 'true';

    const file = this.app.workspace.getActiveFile();
    if (!file) return;
    
    const cache = this.app.metadataCache.getFileCache(file);
    const current = (cache?.frontmatter?.[key] || '').toString();

    valEl.setAttribute('contenteditable', 'false');
    valEl.style.userSelect = 'none';
    valEl.style.cursor = 'pointer';
    valEl.textContent = current || 'Click to set author';
    valEl.title = 'Click to select author';

    valEl.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      
      const authors = this.getAllAuthors();
      const menu = new Menu(this.app);
      
      if (authors.length > 0) {
        for (const author of authors) {
          menu.addItem(i => i.setTitle(author).onClick(async () => {
            await this.app.fileManager.processFrontMatter(file, (fm) => { fm[key] = author; });
            valEl.textContent = author;
          }));
        }
        menu.addSeparator();
      }
      
      menu.addItem(i => i.setTitle('+ New author...').onClick(() => {
        const modal = new Ob.Modal(this.app);
        modal.titleEl.setText('New Author');
        const input = modal.contentEl.createEl('input', { type: 'text', placeholder: 'Enter author name' });
        input.style.width = '100%';
        input.style.marginBottom = '10px';
        const btn = modal.contentEl.createEl('button', { text: 'Add' });
        btn.onclick = async () => {
          const trimmed = input.value.trim();
          if (trimmed) {
            await this.app.fileManager.processFrontMatter(file, (fm) => { fm[key] = trimmed; });
            valEl.textContent = trimmed;
          }
          modal.close();
        };
        modal.open();
        input.focus();
      }));
      
      const r = valEl.getBoundingClientRect();
      menu.showAtPosition({ x: r.left, y: r.bottom + 4 });
    });
  }

  getParentsForChild(filename) {
    const match = filename.match(/^(\d)(\d)_/);
    if (!match || match[2] === '0') return [];
    
    const [, first] = match;
    const parentPrefix = `${first}0_`;
    
    return this.app.vault.getMarkdownFiles()
      .filter(f => f.basename.startsWith(parentPrefix))
      .map(f => f.basename.replace(/^\d\d_/, ''))
      .sort();
  }

  applyParentType(row) {
    row.setAttribute('data-pl-type', 'parent');
    const key = row.getAttribute('data-property-key');
    const valEl = row.querySelector('.metadata-property-value');
    if (!valEl) return;

    if (valEl.dataset.parentApplied === 'true') return;
    valEl.dataset.parentApplied = 'true';

    const file = this.app.workspace.getActiveFile();
    if (!file) return;
    
    // Ensure this property stays mapped as parent type
    if (!this.settings) this.settings = { map: {} };
    this.settings.map[key] = 'parent';
    this.saveData(this.settings);
    
    const parents = this.getParentsForChild(file.basename);
    
    valEl.setAttribute('contenteditable', 'false');
    valEl.style.userSelect = 'none';
    valEl.innerHTML = '';
    valEl.style.fontStyle = 'italic';
    
    if (parents.length === 0) {
      valEl.textContent = 'No parent found';
      valEl.style.cursor = 'default';
    } else if (parents.length === 1) {
      // Single parent - show directly as link
      const match = file.basename.match(/^(\d)(\d)_/);
      const parentPrefix = match ? `${match[1]}0_` : '';
      
      const link = document.createElement('span');
      link.textContent = parents[0];
      link.style.color = 'var(--text-accent)';
      link.style.textDecoration = 'underline';
      link.style.cursor = 'pointer';
      
      link.addEventListener('click', async (e) => {
        e.preventDefault();
        e.stopPropagation();
        const parentFile = this.app.vault.getMarkdownFiles().find(f => 
          f.basename.startsWith(parentPrefix) && f.basename.replace(/^\d\d_/, '') === parents[0]
        );
        if (parentFile) {
          await this.app.workspace.getLeaf().openFile(parentFile);
        }
      });
      
      valEl.appendChild(link);
    } else {
      // Multiple parents - show with dots toggle if more than 3
      const match = file.basename.match(/^(\d)(\d)_/);
      const parentPrefix = match ? `${match[1]}0_` : '';
      
      if (parents.length <= 3) {
        // Show all parents directly
        parents.forEach((parentName, index) => {
          const link = document.createElement('span');
          link.textContent = parentName;
          link.style.color = 'var(--text-accent)';
          link.style.textDecoration = 'underline';
          link.style.cursor = 'pointer';
          
          link.addEventListener('click', async (e) => {
            e.preventDefault();
            e.stopPropagation();
            const parentFile = this.app.vault.getMarkdownFiles().find(f => 
              f.basename.startsWith(parentPrefix) && f.basename.replace(/^\d\d_/, '') === parentName
            );
            if (parentFile) {
              await this.app.workspace.getLeaf().openFile(parentFile);
            }
          });
          
          valEl.appendChild(link);
          if (index < parents.length - 1) {
            valEl.appendChild(document.createTextNode(', '));
          }
        });
      } else {
        // Show first 3 + separate dots
        const container = document.createElement('span');
        
        // Add first 3 parent links
        parents.slice(0, 3).forEach((parentName, index) => {
          const link = document.createElement('span');
          link.textContent = parentName;
          link.style.color = 'var(--text-accent)';
          link.style.textDecoration = 'underline';
          link.style.cursor = 'pointer';
          
          link.addEventListener('click', async (e) => {
            e.preventDefault();
            e.stopPropagation();
            const parentFile = this.app.vault.getMarkdownFiles().find(f => 
              f.basename.startsWith(parentPrefix) && f.basename.replace(/^\d\d_/, '') === parentName
            );
            if (parentFile) {
              await this.app.workspace.getLeaf().openFile(parentFile);
            }
          });
          
          container.appendChild(link);
          if (index < 2) {
            container.appendChild(document.createTextNode(', '));
          }
        });
        
        // Add separate dots button
        const dotsBtn = document.createElement('span');
        dotsBtn.textContent = '...';
        dotsBtn.style.color = 'var(--text-muted)';
        dotsBtn.style.cursor = 'pointer';
        dotsBtn.style.marginLeft = '4px';
        dotsBtn.style.padding = '2px 4px';
        dotsBtn.style.borderRadius = '3px';
        dotsBtn.style.backgroundColor = 'var(--background-modifier-hover)';
        dotsBtn.title = 'Click to show all parents';
        
        let isExpanded = false;
        
        dotsBtn.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          isExpanded = !isExpanded;
          
          if (isExpanded) {
            // Show all parents
            container.innerHTML = '';
            parents.forEach((parentName, index) => {
              const link = document.createElement('span');
              link.textContent = parentName;
              link.style.color = 'var(--text-accent)';
              link.style.textDecoration = 'underline';
              link.style.cursor = 'pointer';
              
              link.addEventListener('click', async (e) => {
                e.preventDefault();
                e.stopPropagation();
                const parentFile = this.app.vault.getMarkdownFiles().find(f => 
                  f.basename.startsWith(parentPrefix) && f.basename.replace(/^\d\d_/, '') === parentName
                );
                if (parentFile) {
                  await this.app.workspace.getLeaf().openFile(parentFile);
                }
              });
              
              container.appendChild(link);
              if (index < parents.length - 1) {
                container.appendChild(document.createTextNode(', '));
              }
            });
            
            // Add "less" button
            const lessBtn = document.createElement('span');
            lessBtn.textContent = ' less';
            lessBtn.style.color = 'var(--text-muted)';
            lessBtn.style.cursor = 'pointer';
            lessBtn.style.marginLeft = '4px';
            lessBtn.style.padding = '2px 4px';
            lessBtn.style.borderRadius = '3px';
            lessBtn.style.backgroundColor = 'var(--background-modifier-hover)';
            lessBtn.style.fontSize = '0.8em';
            lessBtn.addEventListener('click', () => {
              setTimeout(() => this.paintAll(), 50);
            });
            container.appendChild(lessBtn);
          }
        });
        
        container.appendChild(dotsBtn);
        valEl.appendChild(container);
      }
    }
  }

  applyTypeType(row) {
    row.setAttribute('data-pl-type', 'type');
    const key = row.getAttribute('data-property-key');
    const valEl = row.querySelector('.metadata-property-value');
    if (!valEl) return;

    if (valEl.dataset.typeApplied === 'true') return;
    valEl.dataset.typeApplied = 'true';

    const file = this.app.workspace.getActiveFile();
    if (!file) return;
    
    // Auto-detect type based on filename
    const match = file.basename.match(/^(\d)(\d)_/);
    let nodeType = 'Unknown';
    
    if (match) {
      const [, first, second] = match;
      nodeType = second === '0' ? 'Parent' : 'Child';
      // Automatically update the frontmatter
      this.app.fileManager.processFrontMatter(file, (fm) => { fm[key] = nodeType; });
    }

    valEl.setAttribute('contenteditable', 'false');
    valEl.style.userSelect = 'none';
    valEl.style.cursor = 'default';
    valEl.textContent = nodeType;
    valEl.title = 'Auto-detected type';
  }

  applyIdType(row) {
    row.setAttribute('data-pl-type', 'id');
    const key = row.getAttribute('data-property-key');
    const valEl = row.querySelector('.metadata-property-value');
    if (!valEl) return;

    if (valEl.dataset.idApplied === 'true') return;
    valEl.dataset.idApplied = 'true';

    const file = this.app.workspace.getActiveFile();
    if (!file) return;
    
    // Display the note's filename without XX_ prefix, normalized
    const cleanName = file.basename.replace(/^\d\d_/, '');
    const noteId = cleanName.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    // Automatically update the frontmatter
    this.app.fileManager.processFrontMatter(file, (fm) => { fm[key] = noteId; });

    valEl.setAttribute('contenteditable', 'false');
    valEl.style.userSelect = 'none';
    valEl.style.cursor = 'default';
    valEl.textContent = noteId;
    valEl.title = 'Note filename without prefix';
  }

  updateLastUpdateProperty(file) {
    if (!file || !this.settings?.map) return;
    
    // Find properties that are mapped to 'last update' type
    const lastUpdateProps = Object.keys(this.settings.map).filter(key => 
      this.settings.map[key] === 'last update'
    );
    
    if (lastUpdateProps.length > 0) {
      // Mark this file for update
      if (!this.shouldUpdateLastUpdate) this.shouldUpdateLastUpdate = {};
      this.shouldUpdateLastUpdate[file.path] = true;
      
      // Trigger repaint to show updated value
      setTimeout(() => this.paintAll(), 100);
    }
  }

  applyLastUpdateType(row) {
    row.setAttribute('data-pl-type', 'lastupdate');
    const key = row.getAttribute('data-property-key');
    const valEl = row.querySelector('.metadata-property-value');
    if (!valEl) return;

    if (valEl.dataset.lastupdateApplied === 'true') return;
    valEl.dataset.lastupdateApplied = 'true';

    const file = this.app.workspace.getActiveFile();
    if (!file) return;
    
    // Get current date from frontmatter (don't auto-generate)
    const cache = this.app.metadataCache.getFileCache(file);
    let currentDate = cache?.frontmatter?.[key] || '';
    
    // Only update if we have a pending update from actual editing
    if (this.shouldUpdateLastUpdate && this.shouldUpdateLastUpdate[file.path]) {
      const now = new Date();
      const day = String(now.getDate()).padStart(2, '0');
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const year = now.getFullYear();
      currentDate = `${day}/${month}/${year}`;
      
      // Update the frontmatter
      this.app.fileManager.processFrontMatter(file, (fm) => { fm[key] = currentDate; });
      delete this.shouldUpdateLastUpdate[file.path];
    }

    // Lock field and build custom calendar UI
    valEl.setAttribute('contenteditable', 'false');
    valEl.style.userSelect = 'none';
    valEl.style.cursor = 'default';
    valEl.onkeydown = (e) => { e.preventDefault(); e.stopPropagation(); };

    valEl.textContent = '';
    const wrap = document.createElement('span');
    wrap.className = 'pl-calendar-wrap';
    wrap.style.display = 'inline-flex';
    wrap.style.alignItems = 'center';
    wrap.style.gap = '6px';

    const dateSpan = document.createElement('span');
    dateSpan.className = 'pl-calendar-date';
    dateSpan.textContent = currentDate || 'Not set';
    dateSpan.title = 'Auto-updates when note content is modified (read-only)';
    dateSpan.style.fontFamily = 'monospace';

    wrap.appendChild(dateSpan);
    valEl.appendChild(wrap);
  }

  getAllExistingTags() {
    const allTags = new Set();
    const files = this.app.vault.getMarkdownFiles();
    
    files.forEach(file => {
      const cache = this.app.metadataCache.getFileCache(file);
      if (cache?.frontmatter) {
        Object.entries(cache.frontmatter).forEach(([key, value]) => {
          // Only get tags from properties that are mapped as 'tags' type
          if (this.settings?.map?.[key] === 'tags') {
            if (Array.isArray(value)) {
              value.forEach(tag => {
                if (tag && typeof tag === 'string') {
                  allTags.add(tag.trim());
                }
              });
            }
          }
        });
      }
    });
    
    return Array.from(allTags).sort((a, b) => a.localeCompare(b));
  }

  getChildrenForParent(filename) {
    const match = filename.match(/^(\d)(\d)_/);
    if (!match || match[2] !== '0') return [];
    
    const [, first] = match;
    const childPattern = new RegExp(`^${first}[1-9]_`);
    
    return this.app.vault.getMarkdownFiles()
      .filter(f => childPattern.test(f.basename))
      .map(f => f.basename.replace(/^\d\d_/, ''))
      .sort();
  }
  
  applyChildType(row) {
    row.setAttribute('data-pl-type', 'child');
    const key = row.getAttribute('data-property-key');
    const valEl = row.querySelector('.metadata-property-value');
    if (!valEl) return;

    if (valEl.dataset.childApplied === 'true') return;
    valEl.dataset.childApplied = 'true';

    const file = this.app.workspace.getActiveFile();
    if (!file) return;
    
    // Ensure this property stays mapped as child type
    if (!this.settings) this.settings = { map: {} };
    this.settings.map[key] = 'child';
    this.saveData(this.settings);
    
    const children = this.getChildrenForParent(file.basename);
    
    valEl.setAttribute('contenteditable', 'false');
    valEl.style.userSelect = 'none';
    valEl.innerHTML = '';
    valEl.style.fontStyle = 'italic';
    
    if (children.length === 0) {
      valEl.textContent = 'No children found';
      valEl.style.cursor = 'default';
    } else if (children.length === 1) {
      // Single child - show directly as link
      const match = file.basename.match(/^(\d)(\d)_/);
      const childPrefix = match ? match[1] : '';
      
      const link = document.createElement('span');
      link.textContent = children[0];
      link.style.color = 'var(--text-accent)';
      link.style.textDecoration = 'underline';
      link.style.cursor = 'pointer';
      
      link.addEventListener('click', async (e) => {
        e.preventDefault();
        e.stopPropagation();
        const childFile = this.app.vault.getMarkdownFiles().find(f => 
          f.basename.match(new RegExp(`^${childPrefix}[1-9]_`)) && f.basename.replace(/^\d\d_/, '') === children[0]
        );
        if (childFile) {
          await this.app.workspace.getLeaf().openFile(childFile);
        }
      });
      
      valEl.appendChild(link);
    } else {
      // Multiple children - show with dots toggle if more than 3
      const match = file.basename.match(/^(\d)(\d)_/);
      const childPrefix = match ? match[1] : '';
      
      if (children.length <= 3) {
        // Show all children directly
        children.forEach((childName, index) => {
          const link = document.createElement('span');
          link.textContent = childName;
          link.style.color = 'var(--text-accent)';
          link.style.textDecoration = 'underline';
          link.style.cursor = 'pointer';
          
          link.addEventListener('click', async (e) => {
            e.preventDefault();
            e.stopPropagation();
            const childFile = this.app.vault.getMarkdownFiles().find(f => 
              f.basename.match(new RegExp(`^${childPrefix}[1-9]_`)) && f.basename.replace(/^\d\d_/, '') === childName
            );
            if (childFile) {
              await this.app.workspace.getLeaf().openFile(childFile);
            }
          });
          
          valEl.appendChild(link);
          if (index < children.length - 1) {
            valEl.appendChild(document.createTextNode(', '));
          }
        });
      } else {
        // Show first 3 + separate dots
        const container = document.createElement('span');
        
        // Add first 3 child links
        children.slice(0, 3).forEach((childName, index) => {
          const link = document.createElement('span');
          link.textContent = childName;
          link.style.color = 'var(--text-accent)';
          link.style.textDecoration = 'underline';
          link.style.cursor = 'pointer';
          
          link.addEventListener('click', async (e) => {
            e.preventDefault();
            e.stopPropagation();
            const childFile = this.app.vault.getMarkdownFiles().find(f => 
              f.basename.match(new RegExp(`^${childPrefix}[1-9]_`)) && f.basename.replace(/^\d\d_/, '') === childName
            );
            if (childFile) {
              await this.app.workspace.getLeaf().openFile(childFile);
            }
          });
          
          container.appendChild(link);
          if (index < 2) {
            container.appendChild(document.createTextNode(', '));
          }
        });
        
        // Add separate dots button
        const dotsBtn = document.createElement('span');
        dotsBtn.textContent = '...';
        dotsBtn.style.color = 'var(--text-muted)';
        dotsBtn.style.cursor = 'pointer';
        dotsBtn.style.marginLeft = '4px';
        dotsBtn.style.padding = '2px 4px';
        dotsBtn.style.borderRadius = '3px';
        dotsBtn.style.backgroundColor = 'var(--background-modifier-hover)';
        dotsBtn.title = 'Click to show all children';
        
        let isExpanded = false;
        
        dotsBtn.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          isExpanded = !isExpanded;
          
          if (isExpanded) {
            // Show all children
            container.innerHTML = '';
            children.forEach((childName, index) => {
              const link = document.createElement('span');
              link.textContent = childName;
              link.style.color = 'var(--text-accent)';
              link.style.textDecoration = 'underline';
              link.style.cursor = 'pointer';
              
              link.addEventListener('click', async (e) => {
                e.preventDefault();
                e.stopPropagation();
                const childFile = this.app.vault.getMarkdownFiles().find(f => 
                  f.basename.match(new RegExp(`^${childPrefix}[1-9]_`)) && f.basename.replace(/^\d\d_/, '') === childName
                );
                if (childFile) {
                  await this.app.workspace.getLeaf().openFile(childFile);
                }
              });
              
              container.appendChild(link);
              if (index < children.length - 1) {
                container.appendChild(document.createTextNode(', '));
              }
            });
            
            // Add "less" button
            const lessBtn = document.createElement('span');
            lessBtn.textContent = ' less';
            lessBtn.style.color = 'var(--text-muted)';
            lessBtn.style.cursor = 'pointer';
            lessBtn.style.marginLeft = '4px';
            lessBtn.style.padding = '2px 4px';
            lessBtn.style.borderRadius = '3px';
            lessBtn.style.backgroundColor = 'var(--background-modifier-hover)';
            lessBtn.style.fontSize = '0.8em';
            lessBtn.addEventListener('click', () => {
              setTimeout(() => this.paintAll(), 50);
            });
            container.appendChild(lessBtn);
          }
        });
        
        container.appendChild(dotsBtn);
        valEl.appendChild(container);
      }
    }
  }
  
  applyTagsType(row) {
    row.setAttribute('data-pl-type', 'tags');
    const key = row.getAttribute('data-property-key');
    const valEl = row.querySelector('.metadata-property-value');
    if (!valEl) return;

    if (valEl.dataset.tagsApplied === 'true') return;
    valEl.dataset.tagsApplied = 'true';

    const file = this.app.workspace.getActiveFile();
    if (!file) return;
    
    const cache = this.app.metadataCache.getFileCache(file);
    let tags = cache?.frontmatter?.[key] || [];
    if (typeof tags === 'string') tags = [tags];
    if (!Array.isArray(tags)) tags = [];

    // Initialize tag colors storage
    if (!this.tagColors) this.tagColors = {};

    valEl.setAttribute('contenteditable', 'false');
    valEl.style.userSelect = 'none';
    valEl.style.cursor = 'text';
    valEl.onkeydown = null;

    this.renderTags(valEl, tags, key, file);
  }

  renderTags(valEl, tags, key, file) {
    // Preserve any existing input value before clearing
    const existingInput = valEl.querySelector('input');
    const preservedValue = existingInput ? existingInput.value : '';
    
    valEl.textContent = '';
    const wrap = document.createElement('div');
    wrap.className = 'pl-tags-wrap';
    wrap.style.display = 'flex';
    wrap.style.flexWrap = 'wrap';
    wrap.style.gap = '4px';
    wrap.style.alignItems = 'center';
    wrap.style.position = 'relative';

    // Sort tags alphabetically and render
    const sortedTags = [...tags].sort((a, b) => a.localeCompare(b));
    
    if (sortedTags.length <= 3) {
      // Show all tags directly
      for (const tag of sortedTags) {
        const tagEl = this.createTagElement(tag, key, file);
        wrap.appendChild(tagEl);
      }
    } else {
      // Show with dots toggle
      const tagsContainer = document.createElement('div');
      tagsContainer.style.display = 'flex';
      tagsContainer.style.flexWrap = 'wrap';
      tagsContainer.style.gap = '4px';
      tagsContainer.style.alignItems = 'center';
      
      // Show first 2 tags + dots
      for (let i = 0; i < 2; i++) {
        const tagEl = this.createTagElement(sortedTags[i], key, file);
        tagsContainer.appendChild(tagEl);
      }
      
      const dotsSpan = document.createElement('span');
      dotsSpan.textContent = '...';
      dotsSpan.style.color = 'var(--text-muted)';
      dotsSpan.style.cursor = 'pointer';
      dotsSpan.style.padding = '2px 4px';
      dotsSpan.style.borderRadius = '3px';
      dotsSpan.style.backgroundColor = 'var(--background-modifier-hover)';
      dotsSpan.title = 'Click to show all tags';
      
      let isExpanded = false;
      
      dotsSpan.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        isExpanded = !isExpanded;
        
        if (isExpanded) {
          // Show all tags
          tagsContainer.innerHTML = '';
          for (const tag of sortedTags) {
            const tagEl = this.createTagElement(tag, key, file);
            tagsContainer.appendChild(tagEl);
          }
          
          const collapseSpan = document.createElement('span');
          collapseSpan.textContent = 'less';
          collapseSpan.style.color = 'var(--text-muted)';
          collapseSpan.style.cursor = 'pointer';
          collapseSpan.style.padding = '2px 4px';
          collapseSpan.style.borderRadius = '3px';
          collapseSpan.style.backgroundColor = 'var(--background-modifier-hover)';
          collapseSpan.style.fontSize = '0.8em';
          
          collapseSpan.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            // Reset to compact view
            tagsContainer.innerHTML = '';
            
            // Show first 2 tags
            for (let i = 0; i < 2; i++) {
              const tagEl = this.createTagElement(sortedTags[i], key, file);
              tagsContainer.appendChild(tagEl);
            }
            
            // Re-add dots button
            const newDotsSpan = document.createElement('span');
            newDotsSpan.textContent = '...';
            newDotsSpan.style.color = 'var(--text-muted)';
            newDotsSpan.style.cursor = 'pointer';
            newDotsSpan.style.padding = '2px 4px';
            newDotsSpan.style.borderRadius = '3px';
            newDotsSpan.style.backgroundColor = 'var(--background-modifier-hover)';
            newDotsSpan.title = 'Click to show all tags';
            
            newDotsSpan.addEventListener('click', (e) => {
              e.preventDefault();
              e.stopPropagation();
              
              // Show all tags directly
              tagsContainer.innerHTML = '';
              for (const tag of sortedTags) {
                const tagEl = this.createTagElement(tag, key, file);
                tagsContainer.appendChild(tagEl);
              }
              
              // Add less button
              const newCollapseSpan = document.createElement('span');
              newCollapseSpan.textContent = 'less';
              newCollapseSpan.style.color = 'var(--text-muted)';
              newCollapseSpan.style.cursor = 'pointer';
              newCollapseSpan.style.padding = '2px 4px';
              newCollapseSpan.style.borderRadius = '3px';
              newCollapseSpan.style.backgroundColor = 'var(--background-modifier-hover)';
              newCollapseSpan.style.fontSize = '0.8em';
              
              newCollapseSpan.addEventListener('click', () => {
                setTimeout(() => this.paintAll(), 50);
              });
              
              tagsContainer.appendChild(newCollapseSpan);
            });
            
            tagsContainer.appendChild(newDotsSpan);
          });
          
          tagsContainer.appendChild(collapseSpan);
        }
      });
      
      tagsContainer.appendChild(dotsSpan);
      wrap.appendChild(tagsContainer);
    }

    // Add button for tag selection
    const addBtn = document.createElement('button');
    addBtn.textContent = '+ Add tag';
    addBtn.style.border = '1px solid var(--background-modifier-border)';
    addBtn.style.background = 'var(--background-secondary)';
    addBtn.style.borderRadius = '4px';
    addBtn.style.padding = '2px 8px';
    addBtn.style.fontSize = '0.85em';
    addBtn.style.cursor = 'pointer';
    addBtn.style.color = 'var(--text-muted)';
    
    addBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      
      const modal = new Ob.Modal(this.app);
      modal.titleEl.setText('Add Tag');
      
      const input = modal.contentEl.createEl('input', { type: 'text', placeholder: 'Search or create tag...' });
      input.style.width = '100%';
      input.style.marginBottom = '10px';
      input.style.padding = '8px';
      input.style.border = '1px solid var(--background-modifier-border)';
      input.style.borderRadius = '4px';
      
      const listContainer = modal.contentEl.createEl('div');
      listContainer.style.maxHeight = '200px';
      listContainer.style.overflowY = 'auto';
      listContainer.style.border = '1px solid var(--background-modifier-border)';
      listContainer.style.borderRadius = '4px';
      
      const availableTags = this.getAllExistingTags().filter(tag => !tags.includes(tag));
      
      const updateList = () => {
        const query = input.value.toLowerCase().trim();
        listContainer.innerHTML = '';
        
        const filtered = availableTags.filter(tag => tag.toLowerCase().includes(query));
        
        filtered.forEach(tag => {
          const item = listContainer.createEl('div');
          item.textContent = tag;
          item.style.padding = '8px';
          item.style.cursor = 'pointer';
          item.style.borderBottom = '1px solid var(--background-modifier-border-hover)';
          
          item.addEventListener('mouseenter', () => {
            item.style.backgroundColor = 'var(--background-modifier-hover)';
          });
          item.addEventListener('mouseleave', () => {
            item.style.backgroundColor = 'transparent';
          });
          
          item.addEventListener('click', async () => {
            try {
              const updatedTags = [...tags, tag].sort((a, b) => a.localeCompare(b));
              await this.app.fileManager.processFrontMatter(file, (fm) => { fm[key] = updatedTags; });
            } finally {
              modal.close();
              setTimeout(() => this.paintAll(), 50);
            }
          });
        });
        
        // Show "Create new tag" option if query doesn't match existing tags
        if (query && !availableTags.some(tag => tag.toLowerCase() === query)) {
          const createItem = listContainer.createEl('div');
          createItem.innerHTML = `<strong>+ Create "${query}"</strong>`;
          createItem.style.padding = '8px';
          createItem.style.cursor = 'pointer';
          createItem.style.color = 'var(--text-accent)';
          createItem.style.borderTop = '1px solid var(--background-modifier-border)';
          
          createItem.addEventListener('mouseenter', () => {
            createItem.style.backgroundColor = 'var(--background-modifier-hover)';
          });
          createItem.addEventListener('mouseleave', () => {
            createItem.style.backgroundColor = 'transparent';
          });
          
          createItem.addEventListener('click', async () => {
            try {
              const updatedTags = [...tags, query].sort((a, b) => a.localeCompare(b));
              await this.app.fileManager.processFrontMatter(file, (fm) => { fm[key] = updatedTags; });
            } finally {
              modal.close();
              setTimeout(() => this.paintAll(), 50);
            }
          });
        }
      };
      
      input.addEventListener('input', updateList);
      input.addEventListener('keydown', async (e) => {
        if (e.key === 'Enter') {
          const query = input.value.trim();
          if (query && !tags.includes(query)) {
            const updatedTags = [...tags, query].sort((a, b) => a.localeCompare(b));
            await this.app.fileManager.processFrontMatter(file, (fm) => { fm[key] = updatedTags; });
            modal.close();
            setTimeout(() => this.paintAll(), 50);
          }
        }
      });
      
      updateList();
      modal.open();
      input.focus();
    });

    wrap.appendChild(addBtn);
    valEl.appendChild(wrap);
  }

  createTagElement(tag, key, file) {
    const tagEl = document.createElement('span');
    tagEl.className = 'pl-tag';
    tagEl.style.padding = '2px 8px 2px 8px';
    tagEl.style.borderRadius = '12px';
    tagEl.style.fontSize = '0.85em';
    tagEl.style.cursor = 'pointer';
    tagEl.style.userSelect = 'none';
    tagEl.style.display = 'inline-flex';
    tagEl.style.alignItems = 'center';
    tagEl.style.gap = '4px';
    
    // Apply saved color or default
    const color = this.tagColors[tag] || '#4a90e2';
    tagEl.style.backgroundColor = color + '40';
    tagEl.style.border = `1px solid ${color}`;
    tagEl.style.color = color;

    // Tag text
    const tagText = document.createElement('span');
    tagText.textContent = tag;
    tagText.style.cursor = 'pointer';
    tagText.title = 'Click to change color';
    
    // Click to change color
    tagText.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.showColorPicker(tag, tagEl);
    });
    
    tagEl.appendChild(tagText);

    // Delete button
    const deleteBtn = document.createElement('span');
    deleteBtn.textContent = '×';
    deleteBtn.style.cursor = 'pointer';
    deleteBtn.style.fontSize = '14px';
    deleteBtn.style.fontWeight = 'bold';
    deleteBtn.style.marginLeft = '2px';
    deleteBtn.style.opacity = '0.7';
    deleteBtn.title = 'Remove tag';
    
    deleteBtn.addEventListener('mouseenter', () => {
      deleteBtn.style.opacity = '1';
    });
    deleteBtn.addEventListener('mouseleave', () => {
      deleteBtn.style.opacity = '0.7';
    });
    
    deleteBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const cache = this.app.metadataCache.getFileCache(file);
      let tags = cache?.frontmatter?.[key] || [];
      if (typeof tags === 'string') tags = [tags];
      if (!Array.isArray(tags)) tags = [];
      
      const updatedTags = tags.filter(t => t !== tag);
      this.app.fileManager.processFrontMatter(file, (fm) => { fm[key] = updatedTags; });
      setTimeout(() => this.paintAll(), 50);
    });
    
    tagEl.appendChild(deleteBtn);

    // Right-click to change color
    tagEl.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      this.showColorPicker(tag, tagEl);
    });

    return tagEl;
  }

  showColorPicker(tag, tagEl) {
    const colors = [
      '#4a90e2', '#f39c12', '#e74c3c', '#2ecc71', '#9b59b6',
      '#1abc9c', '#e67e22', '#f1c40f', '#e91e63'
    ];

    const menu = new Menu(this.app);
    for (const color of colors) {
      menu.addItem(item => {
        item.setTitle('●').onClick(() => {
          this.tagColors[tag] = color;
          this.saveTagColors();
          // Update the current tag element
          tagEl.style.backgroundColor = color + '40';
          tagEl.style.border = `1px solid ${color}`;
          tagEl.style.color = color;
          // Update all other instances of this tag
          document.querySelectorAll('.pl-tag').forEach(el => {
            const tagText = el.querySelector('span');
            if (tagText && tagText.textContent === tag) {
              el.style.backgroundColor = color + '40';
              el.style.border = `1px solid ${color}`;
              el.style.color = color;
            }
          });
        });
        const itemEl = item.dom;
        itemEl.style.color = color;
        itemEl.style.fontSize = '20px';
      });
    }
    
    const rect = tagEl.getBoundingClientRect();
    menu.showAtPosition({ x: rect.left, y: rect.bottom + 4 });
  }

  async saveTagColors() {
    if (!this.settings) this.settings = { map: {} };
    this.settings.tagColors = this.tagColors;
    await this.saveData(this.settings);
  }

  async loadTagColors() {
    if (this.settings?.tagColors) {
      this.tagColors = this.settings.tagColors;
    }
  }
  
  async createPluginGuide() {
    const guidePath = 'Custom Properties Plugin Guide.md';
    const existingFile = this.app.vault.getAbstractFileByPath(guidePath);
    
    if (existingFile) return; // Guide already exists
    
    const now = new Date();
    const dateStr = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()}`;
    
    const guideContent = `---
id: Custom Properties Plugin Guide
type: Parent
category: Master
child: auto-detected
tags: []
author: Custom Properties Plugin
version: 1.0.0
last update: ${dateStr}
status: 🟢
---

# Custom Properties Plugin for Obsidian

> **Portfolio Project**: A comprehensive Obsidian plugin that revolutionizes structured documentation through specialized property types, automatic template management, and hierarchical organization.

## Overview

This plugin transforms Obsidian's property system by adding 9 specialized property types designed for hierarchical documentation projects. Originally developed for AI behavior manuals in game development, it's applicable to any structured knowledge system requiring parent-child relationships and automatic organization.

## Key Innovation: XX_ Naming Convention

The plugin's core innovation is the **XX_ naming system** that enables automatic detection and organization:

**Format:** \`XY_NoteName\`
- **X (First Digit)**: Project domain/category (0-9)
- **Y (Second Digit)**: Hierarchy level (0=Parent, 1-9=Child)

### Why This Matters
- **Auto-Detection**: Properties automatically populate based on filename patterns
- **Hierarchical Organization**: Parent/child relationships detected and linked automatically
- **Scalable Structure**: Supports large documentation projects with consistent organization
- **Template Automation**: Smart template application based on hierarchy level

### Category System (First Digit)
- \`0\` - Master
- \`1\` - Game Architecture
- \`2\` - Narrative Design
- \`3\` - Visual Design
- \`4\` - Audio Design
- \`5\` - Technical Development
- \`6\` - Library
- \`7\` - Quality Assurance
- \`8\` - Marketing & Communications
- \`9\` - Legal & Publishing

### Examples
- \`00_Master_AI_System\` (Master Parent)
- \`10_Behavior_Trees\` (Game Architecture Parent)
- \`11_Decision_Making\` (Game Architecture Child)
- \`21_Character_Development\` (Narrative Design Child)

## Technical Features

### 🎯 Core Architecture
- **Menu System Integration**: Seamlessly adds "Custom types" submenu to Obsidian's property interface
- **9 Specialized Property Types**: Each with unique behaviors, custom icons, and interaction patterns
- **Intelligent Template System**: Automatic and manual template application with cleanup
- **Auto-Update Engine**: Organizes existing notes and maintains consistency on plugin load
- **Dynamic Relationship Detection**: Real-time parent/child relationship mapping

### 🏷️ Property Types

1. **ID** 🔍 - Auto-detected filename display (read-only)
2. **Type** 📄 - Auto-detected Parent/Child classification (read-only)
3. **Category** 🔲 - Auto-detected project domain (read-only)
4. **Parent/Child** 👥 - Auto-detected relationships with clickable navigation
5. **Tags** 🏷️ - Colorable tags with add/delete functionality
6. **Author** ✏️ - Clickable selection from existing authors
7. **Version** 📊 - Scrollable semver with lock functionality
8. **Last Update** 📅 - Auto-updating calendar display
9. **Status** 🔴 - Emoji dropdown (🟢🟡🔴🔵⚪)

### 🗂️ Template Commands

**Manual Triggers:**
- \`--ccprop\` - Type this on the very first empty line of a note to apply child template (for X1-X9 notes)
- \`--pcprop\` - Type this on the very first empty line of a note to apply parent template (for X0 notes)

**Automatic Features:**
- Template ordering (parent vs child property sequences)
- Property cleanup (removes invalid properties)
- Missing property detection and addition
- Consistent frontmatter organization

## Property Details

### Auto-Detected Properties (Read-Only)

**ID Property** 🔍
- Displays clean filename without XX_ prefix
- Updates automatically when file is renamed
- Formatted for readability

**Type Property** 📄
- Shows "Parent" for X0_ files
- Shows "Child" for X1-X9_ files
- Auto-detected from second digit

**Category Property** 🔲
- Maps first digit to project domain
- Shows full category name
- Configurable through CATEGORIES variable

**Parent/Child Properties** 👥
- Auto-detects relationships based on filename patterns
- Clickable navigation links
- Expandable UI for multiple relationships
- Live computed fields

### Interactive Properties

**Tags Property** 🏷️
- Colorable tag system with visual indicators
- Add/delete functionality with modal interface
- Search existing tags or create new ones
- Alphabetical sorting

**Author Property** ✏️
- Dropdown selection from existing authors
- "Add new author" functionality
- No manual typing required

**Version Property** 📊
- Scrollable semantic versioning (major.minor.patch)
- Lock/unlock functionality per file
- Minimum version constraint (0.0.1)
- No wrap-around behavior

**Status Property** 🔴
- Emoji dropdown with 5 states:
  - 🟢 Complete
  - 🟡 Draft
  - 🔴 Incomplete
  - 🔵 Testing
  - ⚪ Deprecated

**Last Update Property** 📅
- Auto-updates when editing content
- Calendar format (DD/MM/YYYY)
- Read-only display

## Usage Workflow

### Creating New Structured Notes
1. Create note with XX_ naming pattern
2. Add trigger line: \`--ccprop\` (child) or \`--pcprop\` (parent)
3. Template applies automatically with all 9 properties
4. Focus on content while properties auto-manage

### Converting Existing Properties
1. Click property icon (not property name)
2. Select "Custom types" from submenu
3. Choose desired specialized type
4. Property converts with enhanced functionality

### Navigation and Organization
- Use parent/child links for quick navigation
- Leverage auto-detected relationships
- Track project progress with status indicators
- Version control important changes

## Advanced Usage

### Template Triggers Explained

**\`--ccprop\` (Child Custom Property)**
- Type this on the very first empty line of a note
- Use for X1-X9 notes (children)
- Creates template with: ID, Type, Category, Parent, Tags, Author, Version, Last Update, Status
- Parent property auto-detects based on X0_ pattern
- The trigger line is automatically removed after template application

**\`--pcprop\` (Parent Custom Property)**
- Type this on the very first empty line of a note
- Use for X0 notes (parents)
- Creates template with: ID, Type, Category, Child, Tags, Author, Version, Last Update, Status
- Child property auto-detects based on X1-X9_ pattern
- The trigger line is automatically removed after template application

### Property Conversion System
1. Click any property icon (🏷️ symbol next to property name)
2. Native Obsidian menu appears
3. "Custom types" submenu added at bottom
4. Select specialized property type
5. Property converts with enhanced functionality

### Best Practices

#### File Organization Strategy
1. **Start with Master**: Create \`00_Master_Project\` as root
2. **Category Parents**: Add \`10_\`, \`20_\`, \`30_\` etc. for main categories
3. **Detailed Children**: Use \`11_\`, \`12_\`, \`21_\`, \`22_\` for specific topics
4. **Descriptive Names**: Use clear, descriptive names after XX_ prefix

#### Template Usage Patterns
1. **Immediate Application**: Apply templates right after creating XX_ notes
2. **Let Auto-Detection Work**: Don't manually set ID, Type, Category, Parent/Child
3. **Focus on Content**: Concentrate on Tags, Author, Status for manual input
4. **Version Tracking**: Use version property for important milestone tracking

## Troubleshooting

### Templates Not Applying
- **Check Filename**: Ensure exact XX_ pattern (two digits + underscore)
- **Trigger Position**: Place \`--ccprop\` or \`--pcprop\` as first line
- **Plugin Status**: Verify plugin enabled and CSS snippet active

### Properties Not Converting
- **Click Icon**: Click property icon (🏷️), not property name
- **Find Submenu**: Look for "Custom types" at bottom of menu
- **Property Value**: Ensure property has some value before converting

### Auto-Detection Issues
- **Filename Format**: Verify XX_ naming convention exactly
- **Category Mapping**: Check CATEGORIES variable in plugin code
- **File Save**: Ensure file saved after renaming

---

**Plugin Version:** 1.0.0  
**Created:** ${dateStr}  
**Status:** 🟢 Active

This comprehensive guide covers all plugin features. Start by creating your first XX_ note with a template trigger!`;
    
    try {
      await this.app.vault.create(guidePath, guideContent);
    } catch (error) {
      console.error('Error creating guide:', error);
    }
  }

  createHub() {
    const setFrontmatter = (app, file, mutator) => {
      return app.fileManager.processFrontMatter(file, (fm) => {
        try { mutator(fm || {}); } catch (e) { /* ignore */ }
      });
    };

    const mods = [];
    
    // Hardcoded modules
    mods.push({
      commandId: 'custom-properties:add-author',
      label: 'Author',
      icon: 'user',
      run: async (file) => {
        const cache = this.app.metadataCache.getFileCache(file);
        const current = (cache?.frontmatter?.author) || '';
        const authors = this.getAllAuthors();
        const modal = new Ob.Modal(this.app);
        modal.titleEl.setText('Set Author');
        
        if (authors.length > 0) {
          const select = modal.contentEl.createEl('select');
          select.style.width = '100%';
          select.style.marginBottom = '10px';
          select.createEl('option', { value: '', text: 'Select existing author...' });
          for (const author of authors) {
            select.createEl('option', { value: author, text: author });
          }
          if (current) select.value = current;
          
          const orDiv = modal.contentEl.createEl('div', { text: 'or' });
          orDiv.style.textAlign = 'center';
          orDiv.style.margin = '10px 0';
        }
        
        const input = modal.contentEl.createEl('input', { type: 'text', value: current, placeholder: 'Enter new author name' });
        input.style.width = '100%';
        input.style.marginBottom = '10px';
        const btn = modal.contentEl.createEl('button', { text: 'Set' });
        btn.onclick = async () => {
          const trimmed = input.value.trim() || (authors.length > 0 ? modal.contentEl.querySelector('select').value : '');
          if (trimmed) {
            await setFrontmatter(this.app, file, (fm) => { fm.author = trimmed; });
          }
          modal.close();
        };
        modal.open();
        input.focus();
      },
      getIcon: () => '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/></svg>',
      getDefaultValue: () => '',
      valueMatchesType: (value) => typeof value === 'string' && value.length > 0 && !value.includes('\n'),
      applyType: (plugin, row) => plugin.applyAuthorType(row)
    });
    
    mods.push({
      commandId: 'custom-properties:add-parent',
      label: 'Parent',
      getIcon: () => '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>',
      getDefaultValue: (app, file) => 'auto-detected',
      valueMatchesType: (value) => true,
      applyType: (plugin, row) => plugin.applyParentType(row)
    });
    
    mods.push({
      commandId: 'custom-properties:set-status',
      label: 'Status',
      getIcon: () => '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M9,12l2,2 4,-4"/></svg>',
      getDefaultValue: () => '🔴',
      valueMatchesType: (value) => ['🟢', '🟡', '🔴', '🔵', '⚪'].includes(value),
      applyType: (plugin, row) => plugin.applyStatusType(row)
    });
    
    mods.push({
      commandId: 'custom-properties:set-version',
      label: 'Version',
      getIcon: () => '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 7h16"/><path d="M10 11h4"/><path d="M10 15h4"/><rect x="3" y="4" width="18" height="16" rx="2"/></svg>',
      getDefaultValue: () => '0.0.1',
      valueMatchesType: (value) => typeof value === 'string' && /^\d+\.\d+\.\d+$/.test(value),
      applyType: (plugin, row) => plugin.applyVersionType(row)
    });
    
    mods.push({
      commandId: 'custom-properties:add-type',
      label: 'Type',
      getIcon: () => '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14,2 14,8 20,8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10,9 9,9 8,9"/></svg>',
      getDefaultValue: (app, file) => {
        const match = file.basename.match(/^(\d)(\d)_/);
        if (match) {
          const [, first, second] = match;
          return second === '0' ? 'Parent' : 'Child';
        }
        return 'Unknown';
      },
      valueMatchesType: (value) => ['Parent', 'Child', 'Unknown'].includes(value),
      applyType: (plugin, row) => plugin.applyTypeType(row)
    });
    
    mods.push({
      commandId: 'custom-properties:add-id',
      label: 'ID',
      getIcon: () => '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M4 22 L4 12 Q4 2 12 2 Q20 2 20 12 L20 22"/><path d="M9 13 Q12 7 16 11"/><path d="M8 16 Q12 9 17 16"/><path d="M7 19 Q12 11 18 20"/></svg>',
      getDefaultValue: (app, file) => {
        const cleanName = file.basename.replace(/^\d\d_/, '');
        return cleanName.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
      },
      valueMatchesType: (value) => typeof value === 'string',
      applyType: (plugin, row) => plugin.applyIdType(row)
    });
    
    mods.push({
      commandId: 'custom-properties:add-lastupdate',
      label: 'Last Update',
      getIcon: () => '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>',
      getDefaultValue: () => {
        const now = new Date();
        const day = String(now.getDate()).padStart(2, '0');
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const year = now.getFullYear();
        return `${day}/${month}/${year}`;
      },
      valueMatchesType: (value) => typeof value === 'string' && /^\d{2}\/\d{2}\/\d{4}$/.test(value),
      applyType: (plugin, row) => plugin.applyLastUpdateType(row)
    });
    
    mods.push({
      commandId: 'custom-properties:add-tags',
      label: 'Tags',
      getIcon: () => '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>',
      getDefaultValue: () => [],
      valueMatchesType: (value) => Array.isArray(value) || typeof value === 'string',
      applyType: (plugin, row) => plugin.applyTagsType(row)
    });
    
    mods.push({
      commandId: 'custom-properties:add-child',
      label: 'Child',
      getIcon: () => '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 21v-2a4 4 0 0 0-4-4H4a4 4 0 0 0-4 4v2"/><circle cx="8" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><circle cx="16" cy="5" r="3"/></svg>',
      getDefaultValue: () => 'auto-detected',
      valueMatchesType: (value) => true,
      applyType: (plugin, row) => plugin.applyChildType(row)
    });
    
    mods.push({
      commandId: 'custom-properties:add-category',
      label: 'Category',
      getIcon: () => '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>',
      getDefaultValue: (app, file) => {
        const match = file.basename.match(/^(\d)/);
        if (match) {
          return CATEGORIES[match[1]] || 'Unknown';
        }
        return 'Unknown';
      },
      valueMatchesType: (value) => CATEGORY_VALUES.includes(value),
      applyType: (plugin, row) => plugin.applyCategoryType(row)
    });

    return {
      app: this.app,
      setFrontmatter,
      modules: mods,
      propertyTypes: [],
      customTypes: mods
    };
  }

  attachIconMenus() {
    document.querySelectorAll('.metadata-property').forEach((row) => {
      const icon = row.querySelector('.metadata-property-icon');
      if (!icon || icon.dataset.cpBound) return;
      icon.dataset.cpBound = "1";

      icon.addEventListener('mousedown', () => {
        let tries = 0;
        const timer = setInterval(() => {
          tries++;
          const menus = document.querySelectorAll('.menu');
          const native = menus[menus.length - 1];
          if (native) {
            clearInterval(timer);
            this.injectCustomTypesInto(native, row);
          } else if (tries > 15) {
            clearInterval(timer);
          }
        }, 20);
      }, { capture: true });
    });
  }

  injectCustomTypesInto(nativeMenuEl, row) {
    if (!nativeMenuEl || nativeMenuEl.dataset.cpInjected) {
      return;
    }
    nativeMenuEl.dataset.cpInjected = "1";

    const item = document.createElement('div');
    item.className = 'menu-item';
    item.tabIndex = 0;

    const label = document.createElement('div');
    label.className = 'menu-item-title';
    label.textContent = 'Custom types';

    const hotkey = document.createElement('div');
    hotkey.className = 'menu-item-hotkey';
    hotkey.textContent = '›';

    item.appendChild(label);
    item.appendChild(hotkey);
    
    item.style.backgroundColor = 'var(--background-modifier-hover)';
    item.style.padding = '8px 12px';
    item.style.cursor = 'pointer';
    item.style.borderRadius = '4px';
    item.style.margin = '2px 0';
    
    nativeMenuEl.appendChild(item);

    let sub = null;
    const openSub = () => {
      if (sub) return;
      
      sub = document.createElement('div');
      sub.className = 'menu';
      sub.style.position = 'fixed';
      sub.style.zIndex = '9999999';
      sub.style.backgroundColor = 'var(--background-primary)';
      sub.style.border = '1px solid var(--background-modifier-border)';
      sub.style.borderRadius = '8px';
      sub.style.padding = '4px';
      sub.style.minWidth = '150px';
      sub.style.boxShadow = '0 4px 12px rgba(0,0,0,0.3)';
      document.body.appendChild(sub);
      

      
      const sortedTypes = [...this.hub.customTypes].sort((a, b) => a.label.localeCompare(b.label));
      for (const mod of sortedTypes) {
        const si = document.createElement('div');
        si.className = 'menu-item';
        si.style.padding = '8px 12px';
        si.style.cursor = 'pointer';
        si.style.borderRadius = '4px';
        si.style.display = 'flex';
        si.style.alignItems = 'center';
        si.style.gap = '8px';
        
        // Create icon element
        const icon = document.createElement('div');
        icon.className = 'menu-item-icon';
        icon.style.width = '16px';
        icon.style.height = '16px';
        icon.style.position = 'relative';
        icon.style.flexShrink = '0';
        
        // Add icon from module
        if (mod.getIcon) {
          icon.innerHTML = mod.getIcon();
        }
        
        const st = document.createElement('div');
        st.className = 'menu-item-title';
        st.textContent = mod.label;
        
        si.appendChild(icon);
        si.appendChild(st);
        
        si.addEventListener('mouseenter', () => {
          si.style.backgroundColor = 'var(--background-modifier-hover)';
        });
        si.addEventListener('mouseleave', () => {
          si.style.backgroundColor = 'transparent';
        });
        
        si.addEventListener('click', async (e) => {
          e.preventDefault(); 
          e.stopPropagation();
          
          const oldPropertyKey = row.getAttribute('data-property-key');
          const baseName = mod.label.toLowerCase();
          const file = this.app.workspace.getActiveFile();
          
          if (!file) return;
          
          // Generate unique property name
          const newPropertyKey = this.generateUniquePropertyName(baseName);
          
          // Set default value based on type
          let defaultValue = '';
          const module = this.hub.customTypes.find(m => m.label.toLowerCase() === baseName);
          if (module && module.getDefaultValue) {
            defaultValue = module.getDefaultValue(this.app, file);
          }
          
          // Remove old property and add new one with default value
          await this.app.fileManager.processFrontMatter(file, (fm) => {
            delete fm[oldPropertyKey];
            fm[newPropertyKey] = defaultValue;
          });
          
          // Remove old property type mapping and add new one
          if (!this.settings) this.settings = { map: {} };
          delete this.settings.map[oldPropertyKey];
          this.settings.map[newPropertyKey] = baseName;
          await this.saveData(this.settings);
          

          
          // Close submenu
          if (sub) { sub.remove(); sub = null; }
          
          // Repaint to show the renamed property
          setTimeout(() => this.paintAll(), 100);
        });
        sub.appendChild(si);
      }

      const r = item.getBoundingClientRect();
      sub.style.left = (r.right + 8) + 'px';
      sub.style.top = (r.top) + 'px';

      const closer = (ev) => {
        if (!sub) return;
        if (!sub.contains(ev.target) && !nativeMenuEl.contains(ev.target)) {
          sub.remove(); 
          sub = null;
          window.removeEventListener('mousedown', closer, true);
        }
      };
      window.addEventListener('mousedown', closer, true);
    };

    item.addEventListener('mouseenter', openSub);
    item.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      openSub();
    });
  }

  onunload() {
    if (this.propertyObserver) {
      this.propertyObserver.disconnect();
    }
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }
  }
};