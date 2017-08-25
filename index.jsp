<%@ page language="java" contentType="text/html; charset=UTF-8"
    pageEncoding="UTF-8"%>
<%
String contextPath = pageContext.getServletContext().getContextPath();
response.sendRedirect(contextPath + "/login.html");
%>