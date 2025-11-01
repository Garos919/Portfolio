# Custom Properties Plugin for Obsidian

[Download Plgin](https://raw.githubusercontent.com/Garos919/Portfolio/main/plugins/obsidian%23custom-properties/obsidian-plugin-custom-properties.rar)



> **Portfolio Project**: A comprehensive Obsidian plugin that revolutionizes structured documentation through specialized property types, automatic template management, and hierarchical organization.

## Overview

This plugin transforms Obsidian's property system by adding 9 specialized property types designed for hierarchical documentation projects. Originally developed for AI behavior manuals in game development, it's applicable to any structured knowledge system requiring parent-child relationships and automatic organization.

## Installation

1. Copy the `plugins` folder to your `.obsidian/` directory
2. Copy the `snippets` folder to your `.obsidian/` directory
3. Enable plugin in Obsidian Settings → Community Plugins
4. Enable CSS snippet in Settings → Appearance → CSS Snippets

### File Structure
```
.obsidian/
├── plugins/
│   └── custom-properties/
│       ├── main.js          # Core plugin logic
│       └── manifest.json    # Plugin metadata
└── snippets/
    └── custom-properties.css # Styling and icons
```

## Key Innovation: XX_ Naming Convention

The plugin's core innovation is the **XX_ naming system** that enables automatic detection and organization:

**Format:** `XY_NoteName`
- **X (First Digit)**: Project domain/category (0-9)
- **Y (Second Digit)**: Hierarchy level (0=Parent, 1-9=Child)

### Why This Matters
- **Auto-Detection**: Properties automatically populate based on filename patterns
- **Hierarchical Organization**: Parent/child relationships detected and linked automatically
- **Scalable Structure**: Supports large documentation projects with consistent organization
- **Template Automation**: Smart template application based on hierarchy level

### Category System (First Digit)
- `0` - Master
- `1` - Game Architecture
- `2` - Narrative Design
- `3` - Visual Design
- `4` - Audio Design
- `5` - Technical Development
- `6` - Library
- `7` - Quality Assurance
- `8` - Marketing & Communications
- `9` - Legal & Publishing

### Examples
- `00_Master_AI_System` (Master Parent)
- `10_Behavior_Trees` (Game Architecture Parent)
- `11_Decision_Making` (Game Architecture Child)
- `21_Character_Development` (Narrative Design Child)

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
- `--ccprop` - Type this on the very first empty line of a note to apply child template (for X1-X9 notes)
- `--pcprop` - Type this on the very first empty line of a note to apply parent template (for X0 notes)

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
2. Add trigger line: `--ccprop` (child) or `--pcprop` (parent)
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

**`--ccprop` (Child Custom Property)**
- Type this on the very first empty line of a note
- Use for X1-X9 notes (children)
- Creates template with: ID, Type, Category, Parent, Tags, Author, Version, Last Update, Status
- Parent property auto-detects based on X0_ pattern
- The trigger line is automatically removed after template application

**`--pcprop` (Parent Custom Property)**
- Type this on the very first empty line of a note
- Use for X0 notes (parents)
- Creates template with: ID, Type, Category, Child, Tags, Author, Version, Last Update, Status
- Child property auto-detects based on X1-X9_ pattern
- The trigger line is automatically removed after template application

### Automatic Template Application
- Renaming any note to XX_ pattern triggers automatic template
- Only applies if note is empty or has no frontmatter
- Preserves existing content below frontmatter

### Property Conversion System
1. Click any property icon (🏷️ symbol next to property name)
2. Native Obsidian menu appears
3. "Custom types" submenu added at bottom
4. Select specialized property type
5. Property converts with enhanced functionality

### Relationship Detection
- **Parent Detection**: X0_ files automatically detect X1-X9_ children
- **Child Detection**: X1-X9_ files automatically detect X0_ parent
- **Navigation**: Click relationships to jump between notes
- **Expandable UI**: Multiple relationships show with "..." toggle

### Version Control Features
- **Scrollable Versioning**: Hover over version segments and scroll to increment/decrement
- **Lock Functionality**: Click lock icon to prevent accidental changes
- **Carry Logic**: 9→0 increments next level (e.g., 1.9.9 → 2.0.0)
- **Minimum Constraint**: Cannot go below 0.0.1

### Tag Management
- **Color System**: 9 preset colors for visual organization
- **Search & Create**: Modal interface for finding or creating tags
- **Alphabetical Sorting**: Tags automatically sort for consistency
- **Bulk Management**: Add/remove tags across multiple notes

## Best Practices

### File Organization Strategy
1. **Start with Master**: Create `00_Master_Project` as root
2. **Category Parents**: Add `10_`, `20_`, `30_` etc. for main categories
3. **Detailed Children**: Use `11_`, `12_`, `21_`, `22_` for specific topics
4. **Descriptive Names**: Use clear, descriptive names after XX_ prefix

### Template Usage Patterns
1. **Immediate Application**: Apply templates right after creating XX_ notes
2. **Let Auto-Detection Work**: Don't manually set ID, Type, Category, Parent/Child
3. **Focus on Content**: Concentrate on Tags, Author, Status for manual input
4. **Version Tracking**: Use version property for important milestone tracking

### Navigation Workflows
1. **Top-Down**: Start from `00_Master`, navigate to category parents, then children
2. **Cross-Reference**: Use parent/child links for quick context switching
3. **Status Tracking**: Use status property to track project progress
4. **Tag Filtering**: Use colorful tags for visual project organization

## Troubleshooting

### Templates Not Applying
- **Check Filename**: Ensure exact XX_ pattern (two digits + underscore)
- **Trigger Position**: Place `--ccprop` or `--pcprop` as first line
- **Plugin Status**: Verify plugin enabled and CSS snippet active

### Properties Not Converting
- **Click Icon**: Click property icon (🏷️), not property name
- **Find Submenu**: Look for "Custom types" at bottom of menu
- **Property Value**: Ensure property has some value before converting

### Auto-Detection Issues
- **Filename Format**: Verify XX_ naming convention exactly
- **Category Mapping**: Check CATEGORIES variable in plugin code
- **File Save**: Ensure file saved after renaming

### Relationship Problems
- **Pattern Matching**: Parent (X0_) and children (X1-X9_) must share first digit
- **File Existence**: Related files must exist in vault
- **Cache Refresh**: Try reloading plugin if relationships don't appear

## Technical Implementation

### Architecture Highlights
- **Modular Property System**: Each property type self-contained
- **CSS Variable System**: Comprehensive styling with configurable icons
- **Auto-Refresh Mechanism**: 5-minute intervals prevent UI inconsistencies
- **Template Engine**: Smart ordering and cleanup with validation
- **Relationship Mapping**: Dynamic parent/child detection with live updates

### Performance Features
- **Efficient DOM Manipulation**: Targeted updates only when necessary
- **Memory Management**: Proper cleanup of event listeners and observers
- **Batch Operations**: Bulk updates for existing notes
- **Caching Strategy**: Optimized file system interactions

### Development Insights
This plugin demonstrates several advanced Obsidian development techniques:

1. **Menu System Extension**: Seamless integration with Obsidian's property interface
2. **Dynamic Property Types**: Custom property behaviors beyond Obsidian's defaults
3. **File System Automation**: Intelligent template application and organization
4. **CSS Integration**: Comprehensive styling system with custom icons
5. **State Management**: Per-file settings and cross-session persistence

## Use Cases

### Documentation Projects
- Technical documentation with hierarchical structure
- Knowledge bases with parent/child relationships
- Project management with status tracking
- Research notes with categorization

### Content Creation
- Book/article outlines with chapter/section organization
- Course materials with lesson hierarchies
- Wiki-style documentation
- Process documentation with step-by-step structure

### Game Development (Original Use Case)
- AI behavior documentation
- System architecture planning
- Feature specification tracking
- Asset organization and management

---

**Plugin Version:** 1.0.0  
**Compatibility:** Obsidian 1.4.0+  
**License:** MIT  
**Author:** Nicholas Garos
