package com.myProjects.mindWeave.dto;

import lombok.Data;

//@Data
public class CreatePostDto {
	public CreatePostDto() {
		
	}
	private String heading;
    public String getHeading() {
		return heading;
	}
	public void setHeading(String heading) {
		this.heading = heading;
	}
	public String getBackgroundMode() {
		return backgroundMode;
	}
	public void setBackgroundMode(String backgroundMode) {
		this.backgroundMode = backgroundMode;
	}
	private String content;
    private String fontStyle;
    private String textColor;
    private String backgroundColor;
    private String backgroundMode; // "light" or "dark"
	public String getContent() {
		return content;
	}
	public void setContent(String content) {
		this.content = content;
	}
	public String getFontStyle() {
		return fontStyle;
	}
	public void setFontStyle(String fontStyle) {
		this.fontStyle = fontStyle;
	}
	public String getTextColor() {
		return textColor;
	}
	public void setTextColor(String textColor) {
		this.textColor = textColor;
	}
	public String getBackgroundColor() {
		return backgroundColor;
	}
	public void setBackgroundColor(String backgroundColor) {
		this.backgroundColor = backgroundColor;
	}
	
}