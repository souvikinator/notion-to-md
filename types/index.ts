import { ListBlockChildrenResponse } from "@notionhq/client/build/src/api-endpoints";

export type ListBlockChildrenResponseResults = ListBlockChildrenResponse['results'];

export type ListBlockChildrenResponseResult = ListBlockChildrenResponseResults[0];

export type TextRequest = string;

export type ParsedMarkdownBlock = {
	parent: string;
	children: ParsedMarkdownBlock[];
}

export type Annotations = {
	bold: boolean;
	italic: boolean;
	strikethrough: boolean;
	underline: boolean;
	code: boolean;
	color: "default" | "gray" | "brown" | "orange" | "yellow" | "green" | "blue" | "purple" | "pink" | "red" | "gray_background" | "brown_background" | "orange_background" | "yellow_background" | "green_background" | "blue_background" | "purple_background" | "pink_background" | "red_background";
}

export type Text = {
	type: "text";
	text: {
		content: string;
		link: {
			url: TextRequest;
		} | null;
	};
	annotations: Annotations;
	plain_text: string;
	href: string | null;
}
