import { WCAGCriterion } from "../../types";

export const wcagCriteria: WCAGCriterion[] = [
  {
    id: "1.1.1",
    title: "Non-text Content",
    level: "A",
    principle: "Perceivable",
    version: "2.0",
    summary: "Provide text alternatives for any non-text content so that it can be changed into other forms people need.",
    description: "All non-text content that is presented to the user has a text alternative that serves the equivalent purpose. This ensures individuals with visual impairments or cognitive differences can perceive the information through screen readers, Braille displays, or simplified text formats.",
    whyItMatters: "Without text alternatives, screen readers simply announce 'image' or read out the raw filename (like 'img_2026_05_v3.png'), leaving visually impaired users completely team-blind. High-quality alt descriptions create contextual parity for all users.",
    bestPractices: [
      "Always supply an alt attribute on all <img> elements.",
      "Use an empty alt='' for decorative background/spacing visuals so screen readers skip them.",
      "For diagrams or compound charts, provide a detailed bullet explanation nearby and link it."
    ],
    failureScenarios: [
      "Image elements with no alt attribute.",
      "Buttons with graphical icon markings and no visual label or aria-label.",
      "Captcha validation inputs with zero sound or auxiliary checks."
    ],
    testMethodology: [
      "Inspect the DOM and check that every <img> has an alt property.",
      "Run a screen reader and confirm that interactive icon-only trigger buttons announce their precise action."
    ],
    examples: [
      {
        id: "1.1.1-img",
        title: "Product Visual & Favorite Toggle Button",
        explanation: "Interact with an image asset and an icon button. Observe how a screen reader or automatic validator reacts to missing descriptors.",
        badCode: `<div class="flex flex-col items-center p-6 bg-red-50 text-red-950 border border-red-200 rounded-xl space-y-3">
  <!-- BAD: Image lacks an alt attribute entirely -->
  <img src="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=150" class="w-24 h-24 rounded-full border border-red-300 shadow-sm">
  <p class="font-bold text-base">Fresh Greek Salad</p>
  
  <!-- BAD: Button contains only a raw icon with no text content or labeling -->
  <button class="p-2 bg-red-100 text-red-700 hover:bg-red-200 rounded-full transition-colors cursor-pointer">
    <span aria-hidden="true" class="text-xl">❤️</span>
  </button>
</div>`,
        goodCode: `<div class="flex flex-col items-center p-6 bg-emerald-50 text-emerald-950 border border-emerald-200 rounded-xl space-y-3">
  <!-- GOOD: Image has descriptive, meaningful alt text -->
  <img src="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=150" alt="Fresh Greek salad in a bowl with olives, feta cheese, cucumber slices, and tomatoes" class="w-24 h-24 rounded-full border border-emerald-300 shadow-sm focus:outline-emerald-800">
  <p class="font-bold text-base">Fresh Greek Salad</p>
  
  <!-- GOOD: Button is equipped with a clean aria-label to tell screen readers its action -->
  <button aria-label="Add Fresh Greek Salad to favorites" class="p-2 bg-emerald-100 text-emerald-800 hover:bg-emerald-200 focus:outline-2 focus:outline-offset-2 focus:outline-emerald-805 rounded-full transition-colors cursor-pointer">
    <span aria-hidden="true" class="text-xl">❤️</span>
  </button>
</div>`,
        accessibilityNotes: {
          bad: [
            "The image lacks an `alt` attribute. Visual screen readers will speak the URL or skip it altogether.",
            "The interactive button contains only a HEART emoji, announcing as 'Heart, button' or something unclear rather than describing the action (favoriting the recipe)."
          ],
          good: [
            "The alt text describes the layout of the salad dynamically and accurately.",
            "The `aria-label` provides explicit instructions to screen readers: 'Add Fresh Greek Salad to favorites'."
          ]
        },
        keyboardInstructions: [
          "Press TAB to navigate to the favorite buttons in each example card.",
          "Verify that the button is focusable and displays cursor feedback.",
          "Use a browser inspection tool on the image to confirm that the 'alt' is present in the Good card and absent in the Bad card."
        ]
      }
    ]
  },
  {
    id: "1.2.1",
    title: "Audio or Video Only (Prerecorded)",
    level: "A",
    principle: "Perceivable",
    version: "2.0",
    summary: "Provide alternative transcripts or audio tracks for pre-recorded media files.",
    description: "For prerecorded audio-only (like podcasts) or prerecorded video-only (silent screen captures) media, an alternative text transcript or description must be available adjacent to the media source.",
    whyItMatters: "Deaf users cannot hear podcasts, and blind users cannot see silent walkthrough videos. Capturing descriptions in text solves both problems in minutes.",
    bestPractices: [
      "Always host a full HTML transcript below podcast frames.",
      "Add a detailed written summary describing everything occurring in silent guide videos."
    ],
    failureScenarios: [
      "Uploading an MP3 podcast loop with nothing but a raw download URL block.",
      "Visual slide transitions hosted in a file without text transcripts or audio explanations."
    ],
    testMethodology: [
      "Scan the page for multimedia elements.",
      "Confirm that every pre-recorded track is accompanied by an accessible download button or text layout."
    ],
    examples: [
      {
        id: "1.2.1-audio",
        title: "Interactive Audiobook Walkthrough",
        explanation: "Provide alternative representations for media files. Try reviewing how a silent visual walkthrough or an audio-only guide provides transcripts.",
        badCode: `<div class="p-5 bg-red-50 border border-red-200 rounded-xl space-y-3">
  <p class="text-xs font-bold text-red-950">Audiobook Episode: Intro to WCAG</p>
  <!-- BAD: Hosting audio track with zero written logs -->
  <audio controls src="podcast.mp3" class="w-full"></audio>
  <p class="text-xs text-red-700 font-bold">⚠️ No transcript provided. Deaf or hard of hearing visitors cannot access this content.</p>
</div>`,
        goodCode: `<div class="p-5 bg-emerald-50 border border-emerald-200 rounded-xl space-y-3">
  <p class="text-xs font-bold text-emerald-950">Audiobook Episode: Intro to WCAG</p>
  <audio controls src="podcast.mp3" class="w-full"></audio>
  
  <details class="bg-white p-3 rounded border border-emerald-200 text-xs">
    <summary class="font-bold cursor-pointer text-emerald-800">Show Full Transcript (Text Alternative)</summary>
    <div class="mt-2 text-slate-700 space-y-1">
      <p><strong>[Narrator]:</strong> Welcome to Class! Accessibility means making content usable by everyone.</p>
      <p><strong>[Narrator]:</strong> In this episode, we cover the four main principles: Perceivable, Operable, Understandable, and Robust.</p>
    </div>
  </details>
</div>`,
        accessibilityNotes: {
          bad: [
            "No text transcript is hosted, which blocks deaf users from understanding the podcast."
          ],
          good: [
            "Using a disclosure details widget holds the complete dialogue, letting any user read the content sequentially at their own pace."
          ]
        },
        keyboardInstructions: [
          "Tab to the details disclosure element in the Good card.",
          "Hit SPACEBAR or ENTER to expand the transcript box visually without mouse click aids."
        ]
      }
    ]
  },
  {
    id: "1.2.2",
    title: "Captions (Prerecorded)",
    level: "A",
    principle: "Perceivable",
    version: "2.0",
    summary: "Provide captions for all prerecorded audio content in synchronized media.",
    description: "Ensure captions are synchronized with video timelines. Captions must include spoken dialogue, as well as identified speakers and sound effects (e.g., laughter, door slamming).",
    whyItMatters: "Deaf or hard-of-hearing users rely on text captions to read audio cues in sync with visual movements. Captions also assist non-native speakers or people in noisy public environments.",
    bestPractices: [
      "Use open-standard VTT track formats mapping subtitles.",
      "Format background audio sounds explicitly inside captions (e.g. '[gentle piano music playing]')."
    ],
    failureScenarios: [
      "Embedding video feeds using raw <video> tags without track nodes.",
      "Hosting standard videos with un-captioned auto-generated tracks that are highly inaccurate."
    ],
    testMethodology: [
      "Verify that video players show a visible symbol in controls to toggle CC.",
      "Enable captions and check for sound effect labels."
    ],
    examples: []
  },
  {
    id: "1.2.3",
    title: "Audio Description or Alternative",
    level: "A",
    principle: "Perceivable",
    version: "2.0",
    summary: "Provide transcript or audio descriptions for prerecorded videos.",
    description: "An alternative for synchronized media or audio description of the prerecorded video content must be provided. This allows visually impaired individuals to hear spoken narrations of visual context like shifts in scenes, slides, or characters.",
    whyItMatters: "Visual indicators such as silent video captions do not reach blind individuals. Speaking physical movement adds deep context.",
    bestPractices: [
      "Integrate descriptions into the primary audio channel during empty speech beats.",
      "Upload secondary audio channels labeled specifically for descriptive support."
    ],
    failureScenarios: [
      "Silent presentations pointing to products, charts, or slides without narration.",
      "Instructions referring to visual items without vocal audio cues."
    ],
    testMethodology: [
      "Play media files while keeping your eyes closed.",
      "Check whether everything displayed on the slides or screen is adequately explained through verbal dialogue."
    ],
    examples: []
  },
  {
    id: "1.2.4",
    title: "Captions (Live)",
    level: "AA",
    principle: "Perceivable",
    version: "2.0",
    summary: "Provide synchronized captions for live broadcast audio.",
    description: "Captions are provided for all live audio content in synchronized media broadcasts, ensuring instantaneous transcription for stream streams.",
    whyItMatters: "Live speeches, news events, and video calls can isolate deaf individuals completely if real-time captions are absent.",
    bestPractices: [
      "Connect stream broadcasters to live caption service APIs.",
      "Provide physical sign interpreters concurrently on live feeds."
    ],
    failureScenarios: [
      "Publishing standard live broadcasts without real-time synchronization channels.",
      "Live streams with manual lags exceeding 40 seconds behind source verbal tracks."
    ],
    testMethodology: [
      "Activate live captions on real streams.",
      "Measure accuracy and delay relative to active speech timelines."
    ],
    examples: []
  },
  {
    id: "1.2.5",
    title: "Audio Description (Prerecorded)",
    level: "AA",
    principle: "Perceivable",
    version: "2.0",
    summary: "Provide descriptive audio for all prerecorded videos.",
    description: "This criterion ups the Level A requirement by mandating descriptive audiotracks for any prerecorded video. There is no fallback option to simply use a text script.",
    whyItMatters: "Blind users cannot read transcripts while simultaneously tracking real-time soundscapes, making descriptions inside audio channels vital.",
    bestPractices: [
      "Design standard voice scripts with gaps to fit physical scene comments.",
      "Make descriptive audio pathways easy to activate on default players."
    ],
    failureScenarios: [
      "Standard videos containing text overlays with only background generic instrumentation playing."
    ],
    testMethodology: [
      "Select alternative audio menus in video players.",
      "Verify description presence representing visible on-screen elements."
    ],
    examples: []
  },
  {
    id: "1.3.1",
    title: "Info and Relationships",
    level: "A",
    principle: "Perceivable",
    version: "2.0",
    summary: "Information, structure, and relationships conveyed through presentation can be programmatically determined or are available in text.",
    description: "This ensures that structural elements are defined semantically. For example, headers should be <h1>-<h6> tags, lists should be <ul>/<li>, and form inputs must be explicitly coupled with labels rather than represented by loose styled blocks.",
    whyItMatters: "Blind users cannot determine relationships visually (such as which field goes with which label, or which visual text acts as a heading level). Programmatic semantic connections allow assistive technology to outline and read pages logically.",
    bestPractices: [
      "Always nest form inputs inside explicit `<label>` tags or use standard `for` matching.",
      "Declare lists using semantic `<ul>` and `<li>` elements, never simple hyphens or spans.",
      "Format structural grids using `<table>`, `<th>`, and `<td>` components to link columns."
    ],
    failureScenarios: [
      "Visual lists relying on nested styled bullet symbols inside free-standing divs.",
      "Required form labels represented by loose spans above inputs with no IDs."
    ],
    testMethodology: [
      "Tab through form sections and listen to screen reader announcements on active labels.",
      "Use keyboard shortcuts inside a screen reader to count total outline H2/H3 headings."
    ],
    examples: [
      {
        id: "1.3.1-form",
        title: "Account Setup Newsletter Form",
        explanation: "Test how fields are connected to their descriptors. Visual proximity does not equal a programmatic link.",
        badCode: `<div class="p-6 bg-orange-50 border border-orange-200 rounded-xl shadow-sm">
  <!-- BAD: Visual title relies solely on styling instead of a semantic <h2> element -->
  <div class="text-lg font-bold text-orange-950 mb-1">Weekly Newsletter Signup</div>
  <div class="text-xs text-orange-850 mb-4 font-light">Get custom tutorials directly inside your inbox.</div>

  <div class="space-y-3">
    <!-- BAD: Field title is just a listless span with no relational connection to the input below -->
    <span class="block text-xs font-bold text-orange-900">Your Email Address:</span>
    <input type="text" class="w-full p-2 bg-white border border-orange-300 rounded" value="you@example.com">
  </div>

  <button class="w-full mt-4 p-2 bg-orange-600 text-white rounded font-bold hover:bg-orange-700 cursor-pointer">
    Join Newsletter
  </button>
</div>`,
        goodCode: `<div class="p-6 bg-slate-50 border border-slate-200 rounded-xl shadow-sm">
  <!-- GOOD: Structural heading is declared using an <h2> markup -->
  <h2 class="text-lg font-bold text-slate-900 mb-1">Weekly Newsletter Signup</h2>
  <p id="sub-desc-info" class="text-xs text-slate-500 mb-4">Get custom tutorials directly inside your inbox.</p>

  <div class="space-y-3">
    <!-- GOOD: HTML label has an explicit 'for' attribute linking to the input via its unique ID -->
    <label for="validated-sub-email" class="block text-xs font-bold text-slate-700">Your Email Address:</label>
    <input id="validated-sub-email" type="email" aria-describedby="sub-desc-info" class="w-full p-2 bg-white border border-slate-300 rounded focus:ring-2 focus:ring-slate-900 focus:outline-none" value="you@example.com" required>
  </div>

  <button type="submit" class="w-full mt-4 p-2 bg-slate-900 text-white rounded font-bold hover:bg-slate-800 focus:outline-2 focus:outline-offset-2 focus:outline-slate-900 cursor-pointer">
    Join Newsletter
  </button>
</div>`,
        accessibilityNotes: {
          bad: [
            "The title is a `<div>` styled with `font-bold`. Schedulers and screen reader navigation menus will not list this section under their list of available headings.",
            "The input has no ID, and the visual label is just a text `<span>`. Screen readers will announce this as 'Edit text, editing' with no label description."
          ],
          good: [
            "The title is a semantic `<h2>`, making it searchable and outlineable.",
            "The `<label for='...'>` tag links perfectly. When you focus the input, screen readers announce 'Your Email Address, edit text'. Clicking the label also moves focus directly to the input."
          ]
        },
        keyboardInstructions: [
          "Click directly on 'Your Email Address:' in the Good example. Notice that the text input is instantly activated.",
          "Try the same in the Bad example. Visual clicks on the span label do nothing.",
          "Screen readers read 'aria-describedby' content ('Get custom tutorials...') immediately upon focusing the input."
        ]
      }
    ]
  },
  {
    id: "1.3.2",
    title: "Meaningful Sequence",
    level: "A",
    principle: "Perceivable",
    version: "2.0",
    summary: "Arrange page content in an orderly sequence that preserves meaning.",
    description: "When the sequence in which content is presented affects its meaning, an assistive user must be able to explore the layout in a logical reading order.",
    whyItMatters: "CSS flexbox order, grids, or absolute positioning can swap visual blocks without swapping DOM node sequences. Assistive software traverses raw HTML, resulting in confusing layout summaries.",
    bestPractices: [
      "Keep the physical order of HTML structures aligned with visual row positions.",
      "Avoid utilizing negative styles like flex-row-reverse unless columns are purely decorative."
    ],
    failureScenarios: [
      "Using CSS float structures or grid-areas to shuffle physical navigation paths on screens.",
      "Injecting sidebar comments on mobile screens so they get read in the middle of standard paragraphs."
    ],
    testMethodology: [
      "Disable CSS styles and review whether the resulting reading track reads naturally.",
      "Check document source sequential reading paths."
    ],
    examples: []
  },
  {
    id: "1.3.3",
    title: "Sensory Characteristics",
    level: "A",
    principle: "Perceivable",
    version: "2.0",
    summary: "Do not rely solely on shape, size, or auditory cues for instructions.",
    description: "Instructions provided for understanding or operating content should never rely solely on spatial references (e.g., 'click the round circle' or 'look at the box on the right').",
    whyItMatters: "Blind users traversing with screen reader feeds do not know what 'the green circle' represents physically on a desktop.",
    bestPractices: [
      "Provide literal human labels for spatial descriptions (e.g. 'Use the green circle button labeled Confirm to submit').",
      "Avoid relative directions ('on the right side') in instructional labels."
    ],
    failureScenarios: [
      "Directives saying 'To cancel, click the red circle on the right side of the banner.'"
    ],
    testMethodology: [
      "Verify that instructions remain perfectly clear and actionable when visual shapes and locations are completely hid."
    ],
    examples: []
  },
  {
    id: "1.3.4",
    title: "Orientation",
    level: "AA",
    principle: "Perceivable",
    version: "2.1",
    summary: "Constraint orientations of elements should not block viewports.",
    description: "Websites must support both landscape and portrait device alignments seamlessly, without lockouts or cutting off functional modules, unless essential (e.g., banking checks).",
    whyItMatters: "Many users lock devices to standard mount rigs on wheelchairs. Locking websites landscape-only ruins access for portrait-locked visitors.",
    bestPractices: [
      "Do not hardcode CSS orientation queries that lock views landscape or portrait.",
      "Provide responsive fluid column alignments across dynamic view sizes."
    ],
    failureScenarios: [
      "Adding custom Javascript window locks forcing warning overlays to 'Turn your device vertically'."
    ],
    testMethodology: [
      "Simulate orientation switching on web browsers.",
      "Check that controls and views remain accessible on landscape and portrait layout views."
    ],
    examples: []
  },
  {
    id: "1.3.5",
    title: "Identify Input Purpose",
    level: "AA",
    principle: "Perceivable",
    version: "2.1",
    summary: "Use autocomplete attributes for common input forms.",
    description: "Ensure autocomplete properties are assigned on common input fields (e.g., email, street name, password), so browsers can autofill or attach specific symbol icons.",
    whyItMatters: "Users with motor limits or cognitive impairments have difficulty writing strings over and over. Browser autocomplete removes physical entry friction.",
    bestPractices: [
      "Add `autocomplete='email'` on any signup inputs.",
      "Combine autocomplete with proper labeling schemas."
    ],
    failureScenarios: [
      "Forms collecting billing paths without standard autocompletion tags."
    ],
    testMethodology: [
      "Inspect inputs to locate matching autocomplete elements."
    ],
    examples: []
  },
  {
    id: "1.3.6",
    title: "Identify Purpose",
    level: "AAA",
    principle: "Perceivable",
    version: "2.1",
    summary: "Programmatically define the purpose of user interface components.",
    description: "Ensure icons and components have explicit ARIA landmark roles, so users can adapt layouts or customize layouts with alternative symbol formats.",
    whyItMatters: "Cognitive-impaired users can load plugins to replace complex text labels with intuitive, simplified icons if roles are programmatic.",
    bestPractices: [
      "Decorate areas with semantic micro data or custom ARIA descriptors."
    ],
    failureScenarios: [],
    examples: []
  },
  {
    id: "1.4.1",
    title: "Use of Color",
    level: "A",
    principle: "Perceivable",
    version: "2.0",
    summary: "Color must not be used as the sole visual means of conveying information.",
    description: "Do not use color alone to express errors, successes, active statuses, or options. Combine color with secondary cues like text indicators, borders, underlines, or icons.",
    whyItMatters: "Colorblind users (e.g. protanopia) cannot see red highlights on error margins. An adjacent warning text or alert icon makes errors visible instantly.",
    bestPractices: [
      "Underline text links to separate them from non-interactive text.",
      "Accompany color shifts on validation fields with a descriptive warning icon."
    ],
    failureScenarios: [
      "Required form inputs signaling an error solely by painting a thin outline red.",
      "A legend describing active routes by green circles and inactive routes with red circles."
    ],
    testMethodology: [
      "View pages in greyscale using developer simulators.",
      "Confirm that everything continues to carry context and clarity when all hue is stripped."
    ],
    examples: []
  },
  {
    id: "1.4.2",
    title: "Audio Control",
    level: "A",
    principle: "Perceivable",
    version: "2.0",
    summary: "Provide control tools to pause or mute automatic sounds.",
    description: "If any music plays automatically on start for more than 3 seconds, a physical mechanism must be hosted at the top to pause or adjust sound levels easily.",
    whyItMatters: "Autonomous background music overrides screen readers, preventing blind individuals from finding the controls to turn the music off.",
    bestPractices: [
      "Never autoplay background audio tracks.",
      "Host visible mute controls on splash headers."
    ],
    failureScenarios: [
      "Landing pages playing automatic sales loops with no pause button."
    ],
    examples: []
  },
  {
    id: "1.4.3",
    title: "Contrast (Minimum)",
    level: "AA",
    principle: "Perceivable",
    version: "2.0",
    summary: "Visual presentation of text and images of text has a contrast ratio of at least 4.5:1, except for large text or brand icons.",
    description: "Contrast ensures legibility. Regular body text must maintain a 4.5:1 luminosity contrast with its background. Large text (above 18pt/24px or bold 14pt/18.6px) requires at least a 3:1 ratio.",
    whyItMatters: "Many people have limited color sensitivity or low contrast perception. Others suffer from temporary impairments, such as outdoor screen glare. Crisp text guarantees ease of reading for everyone.",
    bestPractices: [
      "Always design themes checking luminosity ratios beforehand.",
      "Avoid styling text with light gray hues against off-white walls."
    ],
    failureScenarios: [
      "Using gray `#888888` on background `#EEEEEE` layouts.",
      "Displaying small subtitle text in bright yellow on white background banners."
    ],
    testMethodology: [
      "Run contrast analysis tools across all element text classes.",
      "Verify color pairings score at least 4.5:1."
    ],
    examples: [
      {
        id: "1.4.3-contrast",
        title: "Terms and Confidentiality Banner",
        explanation: "Evaluate the legibility of content. Text colors must stand out clearly against their container background.",
        badCode: `<div class="p-6 bg-zinc-50 border border-zinc-200 rounded-xl space-y-2">
  <!-- BAD: Light Gray text on off-white background holds low contrast ratio (~1.8:1) -->
  <span class="block text-[10px] text-zinc-350 font-bold tracking-wider">CONFIDENTIAL SECURITY DECREE</span>
  
  <p class="text-[13px] text-zinc-400 font-light leading-relaxed">
    Unauthorized distribution or copying of this file is strictly barred under section-4. Please read this prompt fully before hitting confirm below.
  </p>
  
  <button class="px-3 py-1 bg-yellow-50 text-yellow-300 hover:bg-yellow-100 text-xs rounded">
    I understand, confirm.
  </button>
</div>`,
        goodCode: `<div class="p-6 bg-white border border-zinc-300 rounded-xl space-y-2 shadow-sm">
  <!-- GOOD: Charcoal and dark text on clean white provides a high contrast ratio (~11.5:1) -->
  <span class="block text-[10px] text-zinc-800 font-bold tracking-wider">CONFIDENTIAL SECURITY DECREE</span>
  
  <p class="text-[13px] text-zinc-950 font-medium leading-relaxed">
    Unauthorized distribution or copying of this file is strictly barred under section-4. Please read this prompt fully before hitting confirm below.
  </p>
  
  <button class="px-3 py-1.5 bg-zinc-900 hover:bg-zinc-850 text-white text-xs font-semibold rounded focus:outline-2 focus:outline-offset-2 focus:outline-zinc-900 cursor-pointer">
    I understand, confirm.
  </button>
</div>`,
        accessibilityNotes: {
          bad: [
            "Text color `#a1a1aa` (zinc-400) on soft zinc-50 background fails the 4.5:1 reading barrier, preventing low-vision reading accessibility.",
            "Yellow button text on yellow background renders text entirely invisible."
          ],
          good: [
            "We employ charcoal `#09090b` (zinc-950) text to meet a crisp 11.5:1 ratio.",
            "Interactive buttons are explicitly colored to project unmistakable visual hierarchy."
          ]
        },
        keyboardInstructions: [
          "Examine both blocks from a comfortable reading distance. Notice how much strain is needed to grok the Bad description.",
          "Check how high contrast makes scanning fast, effortless, and accessible even under high solar refraction (outdoor brightness)."
        ]
      }
    ]
  },
  {
    id: "1.4.4",
    title: "Resize Text",
    level: "AA",
    principle: "Perceivable",
    version: "2.0",
    summary: "Support 200% screen text zoom without losing structural readability.",
    description: "Except for captions and images of text, text must be resizable up to 200 percent without assistive technology and without content or functionality breaking.",
    whyItMatters: "Visually impaired users increase browser text sizes. If containers have hardcoded heights, enlarged text leaks and overlaps other modules.",
    bestPractices: [
      "Use fluid unit definitions (`rem` or `em`) rather than rigid pixel values.",
      "Avoid nesting elements inside containers that have raw `height` constraint styling."
    ],
    failureScenarios: [
      "Hardcoded CSS box containers locking elements to height sizes that crop enlarged boundaries."
    ],
    testMethodology: [
      "Zoom browser font layout margins to 200% size.",
      "Check that text flows cleanly inside boxes without overlapping letters."
    ],
    examples: []
  },
  {
    id: "1.4.5",
    title: "Images of Text",
    level: "AA",
    principle: "Perceivable",
    version: "2.0",
    summary: "Avoid rendering textual information inside graphical images.",
    description: "If the technologies being used can achieve the visual presentation, text must be used to convey information rather than images of text, unless essential (e.g., logos).",
    whyItMatters: "Assistive tools cannot parse textual words within pixels of highly customized png elements without optical character plugins.",
    bestPractices: [
      "Represent stylized quote displays using normal HTML markup and modern webfonts.",
      "Avoid embedding tables or flyers inside single images."
    ],
    failureScenarios: [
      "Publishing promotional cards displaying complex event details entirely inside a Jpeg."
    ],
    examples: []
  },
  {
    id: "1.4.10",
    title: "Reflow",
    level: "AA",
    principle: "Perceivable",
    version: "2.1",
    summary: "Content can be presented without loss of information or functionality, and without requiring scrolling in two dimensions.",
    description: "Web layouts must support resizing down to 320px width (or zooming up to 400%) without forcing users to scroll horizontally to read content. This ensures layouts reflow smoothly into vertical columns.",
    whyItMatters: "Many visually impaired users zoom their screens to extremely large scales. If a website forces horizontal scrolling to finish reading sentences, it creates physical fatigue and disrupts reading lines.",
    bestPractices: [
      "Prioritize using fluid percentages or flexbox frameworks.",
      "Avoid incorporating styling grids with absolute widths (e.g., `width: 960px`)."
    ],
    failureScenarios: [
      "Forcing horizontal overflow scrollbars inside small mobile screens.",
      "Rigid tables with hardcoded parameters overflowing viewport layout frames."
    ],
    testMethodology: [
      "Open developer tools, switch viewport sizes to 320px.",
      "Check whether all interactive elements align sequentially without forcing double dimension scrolls."
    ],
    examples: [
      {
        id: "1.4.10-reflow",
        title: "Horizontal Notification Strip",
        explanation: "Interact with layouts in responsive viewports. Notice how widgets wrap safely when cramped.",
        badCode: `<div class="p-4 bg-red-50 border border-red-200 rounded-xl overflow-x-auto">
  <p class="text-[10px] text-neutral-500 font-mono mb-2">Notice: Container forces 500px absolute width layout</p>
  
  <!-- BAD: Hardcoded fixed pixel value prevents adaptation -->
  <div class="flex items-center space-x-4 bg-white p-4 border border-red-200 rounded shadow-sm" style="width: 550px;">
    <div class="bg-red-600 text-white p-2 font-bold text-xs rounded shrink-0">WARNING EXPIRE</div>
    <p class="text-xs text-neutral-800">
      Your subscription will expire tomorrow. Please verify your payment details here! (Scroll right to read)
    </p>
  </div>
</div>`,
        goodCode: `<div class="p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
  <p class="text-[10px] text-neutral-500 font-mono mb-2">Notice: Responsive block adapts seamlessly</p>
  
  <!-- GOOD: Fully responsive layout. Adapts to narrow viewports -->
  <div class="flex flex-col sm:flex-row items-start sm:items-center gap-4 bg-white p-4 border border-emerald-200 rounded shadow-sm max-w-full">
    <div class="bg-emerald-700 text-white p-2 font-bold text-xs rounded shrink-0">CRITICAL SAFETY</div>
    <p class="text-xs text-neutral-800 leading-relaxed">
      Your subscription will expire tomorrow. Please verify your payment details here safely! No zooming issues.
    </p>
  </div>
</div>`,
        accessibilityNotes: {
          bad: [
            "We have inline hardcoded `style='width: 550px;'` in the wrapper. On screens narrower than 550px, a horizontal scrollbar will be forced.",
            "Items do not stack vertically on narrow viewports."
          ],
          good: [
            "We replace hardcoded widths with `max-w-full` which respects responsive constraints.",
            "The layout automatically stacks on mobile screens using the `flex-col sm:flex-row` Tailwind classes, avoiding horizontal scrolls."
          ]
        },
        keyboardInstructions: [
          "Narrow your browser width or zoom in. Observe how the Bad layout stays rigid and forces horizontal scrolling.",
          "Check how the Good layout shifts from horizontal row to a clean vertical stack, keeping all content visible on the screen."
        ]
      }
    ]
  },
  {
    id: "1.4.11",
    title: "Non-text Contrast",
    level: "AA",
    principle: "Perceivable",
    version: "2.1",
    summary: "Visual presentation of interface elements has a contrast ratio of at least 3:1.",
    description: "Ensure that contrast ratios for focus boundaries, form inputs, button boundaries, and graphical assets are at least 3:1 against their adjacent areas.",
    whyItMatters: "If focus indicators or checkbox borders have weak contrast, visually impaired users cannot verify which item is active.",
    bestPractices: [
      "Outline focused items using dark borders scoring at least 3:1 contrast ratios.",
      "Check visual diagrams are clearly separate from background colors."
    ],
    failureScenarios: [
      "Thin light blue focus rectangles on soft cyan canvas screens."
    ],
    examples: []
  },
  {
    id: "1.4.12",
    title: "Text Spacing",
    level: "AA",
    principle: "Perceivable",
    version: "2.1",
    summary: "Allow custom modifications to line height, letter and character spaces.",
    description: "No loss of content must occur when users change margin spaces, word spacing, line spacing, or tracking metrics manually using browser extensions.",
    whyItMatters: "Wider gaps help dyslexic users recognize individual characters.",
    bestPractices: [
      "Avoid hardcoding font sizes containing fixed line metrics.",
      "Check custom spacing plugins are supported."
    ],
    examples: []
  },
  {
    id: "1.4.13",
    title: "Content on Hover or Focus",
    level: "AA",
    principle: "Perceivable",
    version: "2.1",
    summary: "Make custom hover overlays dismissible and hoverable.",
    description: "When visual blocks like tooltips appear upon cursor hover, they must be easily dismissible using keyboard commands (Escape) and must stay visible while user moves the cursor directly across the overlay.",
    whyItMatters: "If tooltip content vanishes as soon as mouse moves, low-vision zoom users cannot drift eyes to read it.",
    bestPractices: [
      "Let users dismiss tooltip popups by hitting ESC.",
      "Do not make tooltips auto-dismiss unless target element loses complete focus."
    ],
    examples: []
  },
  {
    id: "2.1.1",
    title: "Keyboard Operable",
    level: "A",
    principle: "Operable",
    version: "2.0",
    summary: "All functionality of the content is operable through a keyboard interface without requiring specific timings for individual keystrokes.",
    description: "Every interactive control—such as buttons, links, dropdowns, modal dismissals, and tabs—must be focusable using standard keyboard controls (mostly TAB) and fully triggered using action keys (Enter/Space).",
    whyItMatters: "Many users cannot use a computer mouse due to motor disabilities, tremors, injuries, or visual impairments. They rely entirely on keyboard shortcuts, switch keys, or mouthful devices that emulate standard keystrokes.",
    bestPractices: [
      "Use semantic standard markup (`<button>`, `<a>`, `<input>`) rather than building fake clickable div modules.",
      "Provide manual focus indices (e.g. `tabindex='0'`) only on custom elements that genuinely need focus.",
      "Bind keypress listeners in addition to raw click triggers."
    ],
    failureScenarios: [
      "Attaching `onclick` attributes to styled `<div>` blocks without key binders.",
      "Custom components completely skipped inside standard sequence TAB cycles."
    ],
    testMethodology: [
      "Navigate across your entire app using only the keyboard TAB key.",
      "Confirm that every link, input, and collapse button can be fully activated without touching a mouse."
    ],
    examples: [
      {
        id: "2.1.1-event",
        title: "Terms and Authorization Confirmation",
        explanation: "Test how mouse activation versus keyboard activation works. Check whether a custom action element can be traversed.",
        badCode: `<div class="p-6 bg-amber-50 border border-amber-200 rounded-xl text-center space-y-4">
  <p class="text-sm text-neutral-700">Please review and confirm to proceed with registration:</p>
  
  <!-- BAD: Div acting as a button. Lacks tabIndex, role, and keypress handler -->
  <div onclick="alert('Success! Registration confirmed.')" class="mx-auto w-56 p-3 bg-amber-500 text-white rounded-lg font-bold shadow-md cursor-pointer hover:bg-amber-600 active:scale-[0.98] transition-transform">
    Confirm Registration ✔
  </div>
  
  <p class="text-xs text-amber-700 italic">Notice: Only a mouse user can click on this confirmation button!</p>
</div>`,
        goodCode: `<div class="p-6 bg-emerald-50 border border-emerald-200 rounded-xl text-center space-y-4">
  <p class="text-sm text-neutral-700">Please review and confirm to proceed with registration:</p>
  
  <!-- GOOD: Fully semantic standard button, instantly focusable, keyboard accessible by default -->
  <button onclick="alert('Success! Registration confirmed.')" class="mx-auto block w-56 p-3 bg-emerald-700 text-white rounded-lg font-bold shadow-md hover:bg-emerald-800 active:scale-[0.98] transition-transform focus:outline-2 focus:outline-offset-2 focus:outline-emerald-805 cursor-pointer">
    Confirm Registration ✔
  </button>
  
  <p class="text-xs text-emerald-800">Support standard key activation with zero custom JS work!</p>
</div>`,
        accessibilityNotes: {
          bad: [
            "The button is represented by a `<div>`. It will be entirely bypassed during keyboard TAB cycles.",
            "No keystat/keydown listeners exist. Even if screen readers somehow reached it, pressing 'Enter' or 'Space' would not trigger the `onclick` handler."
          ],
          good: [
            "We use a correct standard `<button>` element. It is natively focusable out of the box.",
            "The browser automatically triggers the click event when 'Enter' or 'Space' key is hit while focused, supporting both inputs natively."
          ]
        },
        keyboardInstructions: [
          "Try to focus the 'Confirm Registration' button in the Bad box using your keyboard TAB key. Notice it is skipped.",
          "Press TAB again until you reach the button in the Good box. It glows with an active focus indicator.",
          "Press 'SPACEBAR' or 'ENTER' to trigger the success popup on the Good button easily!"
        ]
      }
    ]
  },
  {
    id: "2.1.2",
    title: "No Keyboard Trap",
    level: "A",
    principle: "Operable",
    version: "2.0",
    summary: "Ensure keyboard focus is not locked inside any singular sub-module or wizard.",
    description: "If focus can be moved to a component of the page using a keyboard interface, then focus must also be able to be moved away from that component using only a keyboard interface.",
    whyItMatters: "Users can get permanently trapped inside widgets (e.g., custom calendar pickers or auto-popups) if clear escape routes are missing, forcing them to reload pages.",
    bestPractices: [
      "Enable closing overlay modals when users hit the ESC escape button.",
      "Check interactive elements do not recursively redirect keyboard cycles inside themselves."
    ],
    failureScenarios: [
      "Custom autocomplete lists locking focus loop flows and preventing tab progress beyond inputs."
    ],
    examples: []
  },
  {
    id: "2.1.3",
    title: "Keyboard (No Exception)",
    level: "AAA",
    principle: "Operable",
    version: "2.0",
    summary: "Support complete keyboard access with zero contextual exceptions.",
    description: "Every single feature or system utility on pages must be operable through keyboard controls, without exception. This raises Level A's threshold.",
    whyItMatters: "Any utility requiring pure analog gestures locks out key user brackets.",
    bestPractices: [],
    examples: []
  },
  {
    id: "2.1.4",
    title: "Character Key Shortcuts",
    level: "A",
    principle: "Operable",
    version: "2.1",
    summary: "Allow muting or customization of character-only quick keys.",
    description: "If shortcuts involve single letters/punctuation (e.g., pressing 'M' to mute), users must be able to turn them off or switch them to include modifiers like Control/Alt.",
    whyItMatters: "Speech-to-text software users might speak words that accidentally trigger custom browser hotkeys.",
    bestPractices: [
      "Prompt before activating single-character quick hotkeys.",
      "Let users map key combinations manually."
    ],
    examples: []
  },
  {
    id: "2.2.1",
    title: "Timing Adjustable",
    level: "A",
    principle: "Operable",
    version: "2.0",
    summary: "Allow extending or disabling page session time-outs.",
    description: "If active pages incorporate countdown durations or auto-logouts, provide easy alert notifications allowing users to double the expiration time.",
    whyItMatters: "Cognitive differences, dyslexia, or motor limits make completing checkout forms slower.",
    bestPractices: [
      "Show a dialog box 2 minutes before timeouts, letting users hit a key to prolong.",
      "Avoid using rigid system countdown blocks."
    ],
    examples: []
  },
  {
    id: "2.2.2",
    title: "Pause, Stop, Hide",
    level: "A",
    principle: "Operable",
    version: "2.0",
    summary: "Provide controls to halt moving, blinking, or flashing items.",
    description: "Any auto-scrolling strings or animations that play automatically on load for more than 5 seconds must include explicit pause or discard selectors.",
    whyItMatters: "Blinking banners distract users with attention disorders, preventing them from reading adjacent texts safely.",
    bestPractices: [
      "Nest play/pause symbols on rotating promotional slideshows.",
      "Allow disabling visual parallax background loops."
    ],
    examples: []
  },
  {
    id: "2.3.1",
    title: "Three Flashes or Below Threshold",
    level: "A",
    principle: "Operable",
    version: "2.0",
    summary: "Avoid elements that flash more than three times in any 1-second interval.",
    description: "Keep flashing visual objects below safe frequency limits to prevent triggering seizures or photic physical episodes.",
    whyItMatters: "Rapid light transitions can cause physical seizures or migraine triggers.",
    bestPractices: [
      "Never animate flashing elements rapidly on design paths.",
      "Keep transitions slow."
    ],
    examples: []
  },
  {
    id: "2.3.2",
    title: "Three Flashes",
    level: "AAA",
    principle: "Operable",
    version: "2.0",
    summary: "Strict prohibition of rapid flashing blocks.",
    description: "Zero flashing intervals are allowed on screen regions, meeting strict clinical thresholds.",
    whyItMatters: "Provides a safe environment for people with photo-sensitive medical histories.",
    examples: []
  },
  {
    id: "2.3.3",
    title: "Animation from Interactions",
    level: "AAA",
    principle: "Operable",
    version: "2.1",
    summary: "Allow disabling movement animations that are triggered by scrolling.",
    description: "Movement triggered by user actions, such as scrolling parallax effects, must be easily switchable unless essential.",
    whyItMatters: "Reduces nausea and motion sickness for vestibular disorder sufferers.",
    bestPractices: [
      "Support the prefers-reduced-motion media query to strip active physics loops."
    ],
    examples: []
  },
  {
    id: "2.4.1",
    title: "Bypass Blocks",
    level: "A",
    principle: "Operable",
    version: "2.0",
    summary: "Provide skiplinks to bypass repeated headers.",
    description: "Include mechanisms to bypass repeated blocks of content, such as a skip-navigation button that appears when keyboard users first press Tab.",
    whyItMatters: "Keyboard users otherwise have to press Tab dozens of times to navigate through header links on every page transition.",
    bestPractices: [
      "Nest a high-visibility skip link as the very first interactive node in the HTML document body."
    ],
    examples: []
  },
  {
    id: "2.4.2",
    title: "Page Titled",
    level: "A",
    principle: "Operable",
    version: "2.0",
    summary: "Assign unique, descriptive title strings to pages.",
    description: "Each document must possess a descriptive, contextual `<title>` indicating the system location and details.",
    whyItMatters: "Sighted or blind users scan multiple open browser tabs by reading title headers.",
    bestPractices: [
      "Format titles as: [Page Section] — [App Name]."
    ],
    examples: []
  },
  {
    id: "2.4.3",
    title: "Focus Order",
    level: "A",
    principle: "Operable",
    version: "2.0",
    summary: "If a webpage can be navigated sequentially, focusable components must receive focus in an order that preserves meaning and operability.",
    description: "The sequence in which interactive components acquire viewport focus must mirror the logical flow of the web document. Never use high positive tabindex values (e.g., tabindex='2') because it forces the cursor to jump erratically across unrelated panels.",
    whyItMatters: "Erratic jumps across form fields disturb user layout tracking. Standard screen readers rely on natural source order to convey content contextually; when focus paths jump out of sync, the site becomes frustrating or unusable.",
    bestPractices: [
      "Order markup top-to-bottom so keyboard streams glide row-by-row naturally.",
      "Do not use positive tabindex parameters (>0) under any design conditions.",
      "Keep dynamic grids or overlays aligned with natural DOM orders."
    ],
    failureScenarios: [
      "Adding custom input elements with explicit staggered `tabindex` settings.",
      "Popups injecting DOM nodes that are visually floating but appended at the very bottom, causing focus to leap unexpectedly."
    ],
    testMethodology: [
      "Select an input and repeatedly hit Tab.",
      "Map out the visual path of the focus indicator and verify it doesn't jump."
    ],
    examples: [
      {
        id: "2.4.3-flow",
        title: "Shipping Info Input Form",
        explanation: "Try tabbing through fields. See whether focus follows the natural row-by-row layout or jumps chaotically.",
        badCode: `<div class="p-5 bg-purple-50 border border-purple-200 rounded-xl space-y-3">
  <p class="text-xs text-purple-900 font-bold mb-2">Check-Out Address (Bad Order! TabIndex Overrides)</p>
  
  <div class="grid grid-cols-2 gap-3">
    <div>
      <span class="block text-[10px] text-purple-700 font-bold mb-1">First Name (Index 3)</span>
      <input type="text" placeholder="First Name" class="w-full p-2 border bg-white rounded" tabindex="3">
    </div>
    <div>
      <span class="block text-[10px] text-purple-700 font-bold mb-1">Last Name (Index 1)</span>
      <input type="text" placeholder="Last Name" class="w-full p-2 border bg-white rounded" tabindex="1">
    </div>
  </div>

  <div class="grid grid-cols-2 gap-3">
    <div>
      <span class="block text-[10px] text-purple-700 font-bold mb-1">Promo Code (Index 4)</span>
      <input type="text" placeholder="Promo Code" class="w-full p-2 border bg-white rounded" tabindex="4">
    </div>
    <div>
      <span class="block text-[10px] text-purple-700 font-bold mb-1">Postal Code (Index 2)</span>
      <input type="text" placeholder="Postal Code" class="w-full p-2 border bg-white rounded" tabindex="2">
    </div>
  </div>
</div>`,
        goodCode: `<div class="p-5 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
  <p class="text-xs text-slate-800 font-bold mb-2">Check-Out Address (Good Order! Natural DOM sequence)</p>
  
  <div class="grid grid-cols-2 gap-3">
    <div>
      <label for="sh-first-name" class="block text-[10px] text-slate-700 font-bold mb-1">First Name</label>
      <input id="sh-first-name" type="text" placeholder="First Name" class="w-full p-2 border bg-white rounded focus:ring-2 focus:ring-slate-900 focus:outline-none">
    </div>
    <div>
      <label for="sh-last-name" class="block text-[10px] text-slate-700 font-bold mb-1">Last Name</label>
      <input id="sh-last-name" type="text" placeholder="Last Name" class="w-full p-2 border bg-white rounded focus:ring-2 focus:ring-slate-900 focus:outline-none">
    </div>
  </div>

  <div class="grid grid-cols-2 gap-3">
    <div>
      <label for="sh-postal" class="block text-[10px] text-slate-700 font-bold mb-1">Postal Code</label>
      <input id="sh-postal" type="text" placeholder="Postal Code" class="w-full p-2 border bg-white rounded focus:ring-2 focus:ring-slate-900 focus:outline-none">
    </div>
    <div>
      <label for="sh-promo" class="block text-[10px] text-slate-700 font-bold mb-1">Promo Code</label>
      <input id="sh-promo" type="text" placeholder="Promo Code" class="w-full p-2 border bg-white rounded focus:ring-2 focus:ring-slate-900 focus:outline-none">
    </div>
  </div>
</div>`,
        accessibilityNotes: {
          bad: [
            "We have injected positive inputs like `tabindex='1'`, `tabindex='2'`, and `tabindex='3'`. Focus will leap from 'Last Name' directly down to 'Postal Code', then jump back up to 'First Name', violating intuitive reading behavior.",
            "There are no explicit associated labels."
          ],
          good: [
            "We have cleaned explicit tabindices. The browser traverses sequentially based on true node order in the document representation.",
            "The logical flow remains First Name -> Last Name -> Postal Code -> Promo Code, perfectly mirroring visual layout."
          ]
        },
        keyboardInstructions: [
          "Starting above the Bad card, type Tab multiple times.",
          "Check how focus skips dynamically from Last Name (Index 1) -> Postal Code (Index 2) -> First Name (Index 3) -> Promo Code (Index 4).",
          "Now, repeat inside the Good box. Notice focus glides predictably from left-to-right, row-by-row."
        ]
      }
    ]
  },
  {
    id: "2.4.4",
    title: "Link Purpose (In Context)",
    level: "A",
    principle: "Operable",
    version: "2.0",
    summary: "Ensure links explicitly describe their destination rather than generic text.",
    description: "The purpose of each link can be determined from the link text alone or from the link text together with its programmatically determined link context.",
    whyItMatters: "Links such as 'Click Here' or 'Read More' convey no informational value when read in a linear screen reader link index.",
    bestPractices: [
      "Avoid using generic labels.",
      "Use descriptive text (e.g., 'Download WCAG Summary PDF' instead of 'Click Here')."
    ],
    failureScenarios: [
      "Pages having multiple repeated links of 'Learn More' all redirecting to different locations."
    ],
    examples: []
  },
  {
    id: "2.4.5",
    title: "Multiple Ways",
    level: "AA",
    principle: "Operable",
    version: "2.0",
    summary: "Provide multiple paths to discover sections.",
    description: "Ensure users can discover web pages in more than one way, such as through a navigation menu, a site map, or a site search input.",
    whyItMatters: "Different categories of cognitive abilities find hierarchies confusing, but operate search engines with ease. Multiple access layers satisfy everyone.",
    bestPractices: [
      "Add a site-search query index.",
      "Host a visible site-map links footer."
    ],
    examples: []
  },
  {
    id: "2.4.6",
    title: "Headings and Labels",
    level: "AA",
    principle: "Operable",
    version: "2.0",
    summary: "Headings and form labels must be descriptive and unique.",
    description: "Ensure page headings clearly separate sections using descriptive, unambiguous text, and check that form inputs are clearly labeled.",
    whyItMatters: "Enables keyboard and screen reader users to scan pages efficiently.",
    bestPractices: [
      "Do not label sections with vague headers like 'Misc'."
    ],
    examples: []
  },
  {
    id: "2.4.7",
    title: "Focus Visible",
    level: "A",
    principle: "Operable",
    version: "2.0",
    summary: "Any keyboard operable user interface has a mode of operation where the keyboard focus indicator is visible.",
    description: "When interactive controls receive focus, a visual outline must appear to indicate current cursor placement. Never hide the focus outline with 'outline: none' unless you provide a robust, distinctive equivalent.",
    whyItMatters: "Keyboard users must be able to see precisely where focus is at any given moment. Sighted keyboard users, people with dyslexia, tremors, or dynamic visual deficits become totally lost online when focus rings are hidden.",
    bestPractices: [
      "Never disable default focus indicators using CSS blocks that lack equivalent ring indicators.",
      "Style focused shapes using prominent colors that contrast with their background.",
      "Prefer using focus-visible properties to keep indicators focused only for keyboard clients."
    ],
    failureScenarios: [
      "Applying styles like `* { outline: none }` or `button:focus { outline: none }` that strip visual cues completely.",
      "Having focus borders containing colors that blend with background hues."
    ],
    testMethodology: [
      "Disconnect your mouse, then press standard Tab triggers.",
      "Verify that an active, high-visibility visual box tracks your cursor location across every step."
    ],
    examples: [
      {
        id: "2.4.7-outline",
        title: "Navigation Button Row",
        explanation: "Tab across these primary control bars. Is it clear where keyboard commands will execute?",
        badCode: `<div class="p-6 bg-rose-50 border border-rose-200 rounded-xl space-y-3">
  <p class="text-xs text-rose-955 font-bold">Action Strip (BAD: Invisible Focus Ring!)</p>
  <div class="flex flex-wrap gap-2">
    <!-- BAD: focus:outline-none acts to suppress visual cursor highlights completely -->
    <button class="px-3 py-1.5 bg-rose-600 text-white rounded text-xs font-semibold hover:bg-rose-700 focus:outline-none">Save Settings</button>
    <button class="px-3 py-1.5 bg-slate-200 text-slate-800 rounded text-xs font-medium hover:bg-slate-300 focus:outline-none">Delete Post</button>
    <button class="px-3 py-1.5 border border-rose-300 text-rose-900 rounded text-xs hover:bg-rose-100 focus:outline-none">Export CSV</button>
  </div>
</div>`,
        goodCode: `<div class="p-6 bg-emerald-50 border border-emerald-200 rounded-xl space-y-3">
  <p class="text-xs text-emerald-950 font-bold">Action Strip (GOOD: High Contrast Focus Outlines)</p>
  <div class="flex flex-wrap gap-2">
    <!-- GOOD: High-contrast focus outline offset is applied to render clear halos -->
    <button class="px-3 py-1.5 bg-emerald-700 text-white rounded text-xs font-semibold hover:bg-emerald-800 focus:outline-2 focus:outline-offset-2 focus:outline-emerald-805 cursor-pointer">Save Settings</button>
    <button class="px-3 py-1.5 bg-slate-200 text-slate-800 rounded text-xs font-medium hover:bg-slate-300 focus:outline-2 focus:outline-offset-2 focus:outline-slate-805 cursor-pointer">Delete Post</button>
    <button class="px-3 py-1.5 border border-emerald-300 text-emerald-900 rounded text-xs hover:bg-emerald-100 focus:outline-2 focus:outline-offset-2 focus:outline-emerald-805 cursor-pointer">Export CSV</button>
  </div>
</div>`,
        accessibilityNotes: {
          bad: [
            "The CSS resets button outline to none without providing fallback indicator styles.",
            "Tabbing here provides no diagnostic feedback, which isolates keyboard viewers completely."
          ],
          good: [
            "We leverage `focus:outline-2` with `focus:outline-offset-2` to paint high-contrast visual cues.",
            "Visual cues adapt dynamically to support user styling preferences."
          ]
        },
        keyboardInstructions: [
          "TAB repeatedly through the buttons on both cards.",
          "Check how the Good buttons project a prominent, high-contrast dark green border with space spacing (offset), whereas Bad buttons remain unresponsive to key selections.",
          "Inspect source to check Tailwind's high-contrast ring utilities."
        ]
      }
    ]
  },
  {
    id: "2.4.9",
    title: "Link Purpose (Link Only)",
    level: "AAA",
    principle: "Operable",
    version: "2.0",
    summary: "Make each link text completely self-descriptive outside of its surrounding sentences.",
    description: "A mechanism must be available to allow all links to be programmatically and contextually understandable purely from their text alone.",
    whyItMatters: "Provides high independence for screen reader users browsing quick link list tables.",
    examples: []
  },
  {
    id: "2.4.10",
    title: "Section Headings",
    level: "AAA",
    principle: "Operable",
    version: "2.0",
    summary: "Organize layout sub-panels using nested semantic section headers.",
    description: "Section headings must be used to organize written content layouts to build clear spatial hierarchies.",
    whyItMatters: "Allows structural and fast understanding of document clusters.",
    examples: []
  },
  {
    id: "2.4.11",
    title: "Focus Not Obscured (Minimum)",
    level: "AA",
    principle: "Operable",
    version: "2.2",
    summary: "Focused components must not be hidden behind overlays or sticky footers.",
    description: "When an element receives keyboard focus, it must not be completely obscured by author-created content like fixed sticky elements or chat overlays.",
    whyItMatters: "Fixed visual items (e.g. cookie bars or chat bubbles) can sit on top of elements, hiding the focus indicator from sight.",
    bestPractices: [
      "Ensure scroll margins (`scroll-padding-top`) are configured with spacing clearances."
    ],
    examples: []
  },
  {
    id: "2.5.1",
    title: "Pointer Gestures",
    level: "A",
    principle: "Operable",
    version: "2.1",
    summary: "Avoid actions requiring complex multi-finger or path-based hand gestures.",
    description: "Any feature operated by multipoint or path-based gestures can also be operated with a single pointer gesture, unless essential.",
    whyItMatters: "Users with tremors or custom hand control rigs cannot perform swipes, pinches, or complex arcs with precision.",
    bestPractices: [
      "Provide flat button controls (+/-) to zoom maps, instead of requiring double-finger pinch swipes."
    ],
    examples: []
  },
  {
    id: "2.5.2",
    title: "Pointer Cancellation",
    level: "A",
    principle: "Operable",
    version: "2.1",
    summary: "Trigger action on pointer up-release rather than mouse-down clicks.",
    description: "Ensure mouse events fire when a mouse button is released (pointer up), rather than clicked down. This allows users to cancel mistakes by moving their cursor off the element before releasing.",
    whyItMatters: "Users with tremors frequently click incorrect buttons by accident. Up-release activation allows them to slide away to revert actions safely.",
    bestPractices: [
      "Bind actions to standard click handlers rather than `mousedown` listeners."
    ],
    examples: []
  },
  {
    id: "2.5.3",
    title: "Label in Name",
    level: "A",
    principle: "Operable",
    version: "2.1",
    summary: "Direct visual text labels must match their programmatic name.",
    description: "For user interface components with labels that include text or images of text, the name contains the text that is presented visually.",
    whyItMatters: "Speech-to-text users can announce visual tags aloud. If programmatic names differ from the visual label, commands fail.",
    bestPractices: [
      "Keep visible string structures contained securely inside ARIA names."
    ],
    examples: []
  },
  {
    id: "2.5.4",
    title: "Motion Actuation",
    level: "A",
    principle: "Operable",
    version: "2.1",
    summary: "Provide button alternatives for screen shake or tilt triggers.",
    description: "Any function triggered by motion (shaking, tilting, panning) can also be operated by standard inputs, and user can turn off motion triggers.",
    whyItMatters: "A device mounted to a wheelchair may shake constantly, triggering functions by accident.",
    examples: []
  },
  {
    id: "2.5.5",
    title: "Touch Target Size",
    level: "AAA",
    principle: "Operable",
    version: "2.1",
    summary: "Make touch targets at least 44x44 CSS pixels in size.",
    description: "The size of the target area for pointer inputs must be at least 44 by 44 CSS pixels, except when target has adjacent options or is inside small descriptive sentences.",
    whyItMatters: "Users with limited finger coordination can easily misclick tiny buttons.",
    bestPractices: [
      "Apply minimum padding sizes around link options to expand click zones without cluttering layouts."
    ],
    examples: []
  },
  {
    id: "2.5.7",
    title: "Dragging Movements",
    level: "AA",
    principle: "Operable",
    version: "2.2",
    summary: "Provide single-click alternatives for drag actions.",
    description: "All functionality that matches dragging (e.g., slider widgets or drag-and-drop lists) can also be operated by regular single-point operations like simple clicks.",
    whyItMatters: "People using specialized mouth wands or eye trackers cannot hold and drag elements visually across screens.",
    bestPractices: [
      "Add auxiliary indicator arrows or click selectors alongside drag lists."
    ],
    examples: []
  },
  {
    id: "2.5.8",
    title: "Target Size (Minimum)",
    level: "AA",
    principle: "Operable",
    version: "2.2",
    summary: "Target dimensions must be at least 24x24 CSS pixels.",
    description: "Maintain a target dimension scale of at least 24 by 24 pixels, or provide sufficient spacing loops around them.",
    whyItMatters: "Prevents accidental clicking of incorrect options.",
    examples: []
  },
  {
    id: "3.1.1",
    title: "Language of Page",
    level: "A",
    principle: "Understandable",
    version: "2.0",
    summary: "Define languages on default HTML landing boundaries.",
    description: "The default language of each page must be declared programmatically through the lang attribute on the top `<html lang='en'>` tag.",
    whyItMatters: "Correct lang attributes instruct screen readers to load correct pronunciation engines and dictionary parameters.",
    bestPractices: [
      "Always set correct lang prefixes inside document root indexes."
    ],
    examples: []
  },
  {
    id: "3.1.2",
    title: "Language of Parts",
    level: "AA",
    principle: "Understandable",
    version: "2.0",
    summary: "Declare languages on embedded foreign phrases.",
    description: "If sections of a page contain phrases in other languages (e.g., quotes in French), wrap them in elements specifying matching lang properties safely.",
    whyItMatters: "Ensures screen reader engines pronounces foreign phrases correctly.",
    examples: []
  },
  {
    id: "3.2.1",
    title: "On Focus",
    level: "A",
    principle: "Understandable",
    version: "2.0",
    summary: "Component focus must not trigger unexpected actions.",
    description: "When any component receives focus, it must not initiate a change of context (such as opening pop-up alerts or submitting forms automatically).",
    whyItMatters: "Keyboard users scroll through navigation trees using the TAB key. If focusing an item triggers unexpected pages or alerts, it disrupts their navigation.",
    bestPractices: [
      "Use focus states purely to show visual indicators."
    ],
    examples: []
  },
  {
    id: "3.2.2",
    title: "On Input",
    level: "A",
    principle: "Understandable",
    version: "2.0",
    summary: "Entering inputs must not trigger automatic context shifts.",
    description: "Entering form options should never trigger automatic context modifications (like dynamic page routing) unless the user has been explicitly warned beforehand.",
    whyItMatters: "Auto-routes on check selections make navigation extremely confusing for blind keyboard users.",
    examples: []
  },
  {
    id: "3.2.3",
    title: "Consistent Navigation",
    level: "AA",
    principle: "Understandable",
    version: "2.0",
    summary: "Navigational mechanisms that are repeated on multiple Web pages within a set of Web pages occur in the same relative order each time they are repeated, unless a change is initiated by the user.",
    description: "Repeated navigation lists or links should maintain consistent names, visual styling, and relative sorting across all pages of a site. This establishes predictive muscle memory.",
    whyItMatters: "Dynamic, unpredictable rearrangement of navigation bars confuses cognitive-impaired users and forces screen reader users to repeatedly parse and relearn the layout order of every page.",
    bestPractices: [
      "Keep repeated menus in identical slots on all views.",
      "Assign identical descriptive labels to repeated navigation headers."
    ],
    failureScenarios: [
      "Websites shifting links around based on dynamic user analytics models on consecutive views."
    ],
    testMethodology: [
      "Open different views inside the app.",
      "Verify that the main navigation bar links are located in identical orders on both views."
    ],
    examples: [
      {
        id: "3.2.3-nav",
        title: "Multi-page Header Layout Sequence",
        explanation: "Check the visual menu layouts on different virtual views. A stable design creates structural confidence.",
        badCode: `<div class="p-4 bg-indigo-50 border border-indigo-200 rounded-xl space-y-4">
  <div>
    <span class="block text-[10px] text-indigo-700 font-bold mb-1">Navbar representation on View A:</span>
    <nav class="flex gap-2 p-2 bg-white border border-indigo-100 rounded shadow-xs">
      <a href="#active-dash" class="px-2 py-1 bg-indigo-600 text-white rounded text-[11px] font-semibold">Dashboard</a>
      <a href="#active-pricing" class="px-2 py-1 text-slate-700 rounded text-[11px] hover:bg-slate-100">Membership Tier</a>
      <a href="#active-about" class="px-2 py-1 text-slate-700 rounded text-[11px] hover:bg-slate-100">Company Bio</a>
    </nav>
  </div>
  
  <div>
    <span class="block text-[10px] text-indigo-700 font-bold mb-1">Navbar representation on View B (Order shuffled, names changed):</span>
    <nav class="flex gap-2 p-2 bg-white border border-indigo-100 rounded shadow-xs">
      <a href="#active-about" class="px-2 py-1 text-slate-700 rounded text-[11px] hover:bg-slate-100">About Our Team</a>
      <a href="#active-dash" class="px-2 py-1 bg-indigo-600 text-white rounded text-[11px] font-semibold">Home Platform</a>
      <a href="#active-pricing" class="px-2 py-1 text-slate-700 rounded text-[11px] hover:bg-slate-100">Buy Seats</a>
    </nav>
  </div>
</div>`,
        goodCode: `<div class="p-4 bg-slate-50 border border-slate-205 rounded-xl space-y-4">
  <div>
    <span class="block text-[10px] text-slate-500 font-bold mb-1">Navbar sequence on View A:</span>
    <nav aria-label="Consistent Primary Navigation Section A" class="flex gap-2 p-2 bg-white border border-slate-250 rounded shadow-xs">
      <a href="#good-dash" class="px-2 py-1 bg-slate-900 text-white rounded text-[11px] font-semibold">Dashboard</a>
      <a href="#good-pricing" class="px-2 py-1 text-slate-700 rounded text-[11px] hover:bg-slate-100 focus:outline-slate-905">Pricing</a>
      <a href="#good-about" class="px-2 py-1 text-slate-700 rounded text-[11px] hover:bg-slate-100 focus:outline-slate-905">About Us</a>
    </nav>
  </div>

  <div>
    <span class="block text-[10px] text-slate-500 font-bold mb-1">Navbar sequence on View B:</span>
    <nav aria-label="Consistent Primary Navigation Section B" class="flex gap-2 p-2 bg-white border border-slate-250 rounded shadow-xs">
      <a href="#good-dash" class="px-2 py-1 text-slate-700 rounded text-[11px] hover:bg-slate-100 focus:outline-slate-905">Dashboard</a>
      <a href="#good-pricing" class="px-2 py-1 bg-slate-900 text-white rounded text-[11px] font-semibold">Pricing</a>
      <a href="#good-about" class="px-2 py-1 text-slate-700 rounded text-[11px] hover:bg-slate-100 focus:outline-slate-905">About Us</a>
    </nav>
  </div>
</div>`,
        accessibilityNotes: {
          bad: [
            "The links are completely shuffled (Dashboard -> Pricing -> About in View A, vs About -> Dashboard -> Pricing in View B).",
            "The labels change dynamically, which is extremely confusing."
          ],
          good: [
            "We maintain exact visual order and exact link names ('Dashboard', 'Pricing', 'About Us') across both versions.",
            "Proper ARIA headings or unique `aria-labels` distinguish these repeated layout bars safely."
          ]
        },
        keyboardInstructions: [
          "Focus the headers. Notice that in the Good card, standard keyboard paths remain identical and predictable.",
          "Check how the active styling shifts nicely while keeping layout ordering in place."
        ]
      }
    ]
  },
  {
    id: "3.2.4",
    title: "Consistent Identification",
    level: "AA",
    principle: "Understandable",
    version: "2.0",
    summary: "Identify elements with the same function consistently.",
    description: "Components that have the same functionality within a set of Web pages are identified consistently (e.g., call-out bubbles, warning banners).",
    whyItMatters: "Ensures cognitive consistency throughout user flows.",
    examples: []
  },
  {
    id: "3.2.5",
    title: "Change on Request",
    level: "AAA",
    principle: "Understandable",
    version: "2.0",
    summary: "Trigger changes of context only at user request.",
    description: "Allows users to turn off automatic context switches entirely.",
    whyItMatters: "Ensures users stay in control of their reading journey.",
    examples: []
  },
  {
    id: "3.2.6",
    title: "Consistent Help",
    level: "A",
    principle: "Understandable",
    version: "2.2",
    summary: "Place support contact details in consistent visual templates.",
    description: "If help/contact options are hosted across multiple pages, they must be located at the same relative layout coordinates.",
    whyItMatters: "Provides a reliable contact point for individuals with learning or memory difficulties.",
    bestPractices: [
      "Keep diagnostic contact links in identical regions, like headers/footers."
    ],
    examples: []
  },
  {
    id: "3.3.1",
    title: "Error Identification",
    level: "A",
    principle: "Understandable",
    version: "2.0",
    summary: "Provide descriptive text warnings for input errors.",
    description: "If an input error is detected, the item that is in error must be identified and the error is described to the user in text.",
    whyItMatters: "Ambiguous error warnings like 'Invalid entry' do not help users correct mistakes on fields they cannot see.",
    bestPractices: [
      "Write explicit solutions specifying how users can correct errors."
    ],
    examples: []
  },
  {
    id: "3.3.2",
    title: "Labels or Instructions",
    level: "A",
    principle: "Understandable",
    version: "2.0",
    summary: "Provide visible labels and instructions for all inputs.",
    description: "Labels or instructions must be provided when content requires user input to clear ambiguity.",
    whyItMatters: "Vague labels (e.g. raw entry areas with zero sample formatting guides) confuse visitors.",
    examples: []
  },
  {
    id: "3.3.3",
    title: "Error Suggestion",
    level: "AA",
    principle: "Understandable",
    version: "2.0",
    summary: "Provide helpful correction suggestions when errors are detected.",
    description: "If an input error is detected and suggestions for correction are known, then the suggestions are provided to the user, unless it compromises security.",
    whyItMatters: "Assists cognitive impaired users in diagnosing invalid data errors.",
    examples: []
  },
  {
    id: "3.3.4",
    title: "Error Prevention (Legal, Financial, Data)",
    level: "AA",
    principle: "Understandable",
    version: "2.0",
    summary: "Allow verifying and reversing bank actions or legal transactions.",
    description: "For pages that execute legal billing or financial transfers, users must be able to cancel transactions, review entries for validation, and correct errors before finalizing.",
    whyItMatters: "Prevents high-risk billing errors caused by motor misclicks.",
    examples: []
  },
  {
    id: "3.3.5",
    title: "Help",
    level: "AAA",
    principle: "Understandable",
    version: "2.0",
    summary: "Provide interactive contextual help modules for fields.",
    description: "Contextual help is available for all forms, providing live guides.",
    whyItMatters: "Reduces anxiety for users with cognitive or learning challenges.",
    examples: []
  },
  {
    id: "3.3.6",
    title: "Error Prevention (All)",
    level: "AAA",
    principle: "Understandable",
    version: "2.0",
    summary: "Let users review and confirm all forms prior to submission.",
    description: "Enforce confirmation checkpages across all input databases without exception.",
    whyItMatters: "Enforces a reliable safety net for form submissions.",
    examples: []
  },
  {
    id: "3.3.7",
    title: "Redundant Entry",
    level: "A",
    principle: "Understandable",
    version: "2.2",
    summary: "Auto-populate duplicate inputs across single session paths.",
    description: "Information previously entered by the user in the same process must be populated automatically or selectable.",
    whyItMatters: "Minimizes typing fatigue for users with cognitive or physical control issues.",
    bestPractices: [
      "Add a checkbox styled 'Billing Address is same as Shipping Address'."
    ],
    examples: []
  },
  {
    id: "3.3.8",
    title: "Accessible Authentication (Minimum)",
    level: "AA",
    principle: "Understandable",
    version: "2.2",
    summary: "Avoid requiring cognitive tests (e.g. math drills) during authentication.",
    description: "A cognitive function test (such as solving math puzzles or decoding blurred text keys) must not be required for any step in an authentication flow unless an alternative is provided.",
    whyItMatters: "People with cognitive differences are locked out of accounts by math grids or complex recall trials.",
    bestPractices: [
      "Allow copy-pasting code keys into credentials portals.",
      "Support standard biometric sign-in tools."
    ],
    examples: []
  },
  {
    id: "4.1.1",
    title: "Parsing",
    level: "A",
    principle: "Robust",
    version: "2.0",
    summary: "Ensure HTML page structures are valid and well-formed.",
    description: "Avoid duplicate attribute IDs, check that tags are nested properly, and verify elements do not contain duplicate properties.",
    whyItMatters: "Invalid code can cause screen reader engines to fail to parse or skip paragraphs entirely.",
    bestPractices: [
      "Run HTML linters inside building phases to clean markup nesting."
    ],
    examples: []
  },
  {
    id: "4.1.2",
    title: "Name, Role, Value",
    level: "A",
    principle: "Robust",
    version: "2.0",
    summary: "Declare clear programmatic names and roles on custom dynamic widgets.",
    description: "Every user interface component (including form elements, links) has a programmatic name, role, and current state.",
    whyItMatters: "Custom widgets (like a custom-engineered toggler div) are blank to screen readers if their visual state isn't exposed programmatically.",
    bestPractices: [
      "Assign roles like `role='switch'` on custom sliders.",
      "Update `aria-checked` states dynamically when elements are clicked."
    ],
    examples: []
  },
  {
    id: "4.1.3",
    title: "Status Messages",
    level: "AA",
    principle: "Robust",
    version: "2.1",
    summary: "Expose dynamic status alerts programmatically using aria-live.",
    description: "Dynamic layout updates (like checkout warnings or toast banners) must be announced to assistive clients using aria-live, without taking screen focus.",
    whyItMatters: "Blind users remain unaware of alerts popping up in the screen margins if aria-live notifications are missing.",
    bestPractices: [
      "Style alert messages using `role='status'` or `aria-live='polite'`."
    ],
    examples: []
  }
];
