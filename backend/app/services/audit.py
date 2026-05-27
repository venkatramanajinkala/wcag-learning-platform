from html.parser import HTMLParser


class AccessibilityHTMLParser(HTMLParser):
    def __init__(self) -> None:
        super().__init__()
        self.images: list[dict[str, str | None]] = []
        self.inputs: list[dict[str, str | None]] = []
        self.labels_for: set[str] = set()
        self.buttons: list[dict[str, str | None]] = []
        self._button_stack: list[list[str]] = []
        self.positive_tabindex: list[str] = []
        self.uses_outline_none = False

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        attr_map = {name.lower(): value for name, value in attrs}
        if tag == "img":
            self.images.append(attr_map)
        if tag in {"input", "select", "textarea"}:
            self.inputs.append(attr_map)
        if tag == "label" and attr_map.get("for"):
            self.labels_for.add(attr_map["for"] or "")
        if tag == "button":
            self.buttons.append(attr_map | {"_text": ""})
            self._button_stack.append([])
        if "tabindex" in attr_map:
            value = attr_map.get("tabindex") or "0"
            try:
                if int(value) > 0:
                    self.positive_tabindex.append(value)
            except ValueError:
                self.positive_tabindex.append(value)
        class_value = attr_map.get("class") or ""
        style_value = attr_map.get("style") or ""
        if "outline-none" in class_value or "outline: none" in style_value.lower():
            self.uses_outline_none = True

    def handle_endtag(self, tag: str) -> None:
        if tag == "button" and self._button_stack:
            text_parts = self._button_stack.pop()
            if self.buttons:
                self.buttons[-1]["_text"] = " ".join(text_parts).strip()

    def handle_data(self, data: str) -> None:
        if self._button_stack:
            self._button_stack[-1].append(data.strip())


def scan_html(html: str) -> tuple[bool, list[str]]:
    parser = AccessibilityHTMLParser()
    parser.feed(html)
    details: list[str] = []
    passed = True

    for index, image in enumerate(parser.images, start=1):
        alt = image.get("alt")
        if alt is None:
            passed = False
            details.append(f"Image {index} is missing an alt attribute.")
        elif alt.strip() == "":
            details.append(f"Image {index} has empty alt text and will be treated as decorative.")
        else:
            details.append(f"Image {index} has alt text.")

    for index, input_item in enumerate(parser.inputs, start=1):
        input_id = input_item.get("id")
        has_aria = bool(input_item.get("aria-label") or input_item.get("aria-labelledby"))
        if not input_id and not has_aria:
            passed = False
            details.append(f"Form field {index} has no id or accessible ARIA label.")
            continue
        if input_id and input_id not in parser.labels_for and not has_aria:
            passed = False
            details.append(f"Form field '{input_id}' is missing a matching label.")
        else:
            details.append(f"Form field {input_id or index} is labeled.")

    for index, button in enumerate(parser.buttons, start=1):
        text = (button.get("_text") or "").strip()
        label = button.get("aria-label") or button.get("aria-labelledby")
        if not text and not label:
            passed = False
            details.append(f"Button {index} has no visible text or accessible label.")
        else:
            details.append(f"Button {index} has an accessible name.")

    if parser.positive_tabindex:
        passed = False
        details.append("Positive tabindex values were found. Use natural DOM order instead.")

    if parser.uses_outline_none:
        passed = False
        details.append("Focus outline removal was detected. Provide a visible focus style.")

    if not details:
        details.append("No basic accessibility issues were found.")

    return passed, details
