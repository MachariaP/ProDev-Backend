# 🐚 Advanced Shell Scripting: Pokémon API Automation

<div align="center">

[![Bash](https://img.shields.io/badge/Bash-5.0+-4EAA25?style=for-the-badge&logo=gnu-bash&logoColor=white)](https://www.gnu.org/software/bash/)
[![cURL](https://img.shields.io/badge/cURL-8.0+-073551?style=for-the-badge&logo=curl&logoColor=white)](https://curl.se/)
[![jq](https://img.shields.io/badge/jq-1.7+-B9922A?style=for-the-badge&logo=json&logoColor=white)](https://stedolan.github.io/jq/)
[![PokeAPI](https://img.shields.io/badge/PokéAPI-v2-EF5350?style=for-the-badge&logo=pokemon&logoColor=white)](https://pokeapi.co/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)

**Master Advanced Shell Scripting by Building Real-World API Automation Pipelines**

*Transform raw API data into actionable insights using the power of the command line*

[🚀 Quick Start](#-quick-start) • [📚 Learning Objectives](#-learning-objectives) • [🛠️ Tools](#-tools-and-libraries) • [📋 Tasks](#-project-tasks)

</div>

---

## 📜 Table of Contents

- [1. Project Overview](#1-project-overview)
- [2. Team Roles and Responsibilities](#2-team-roles-and-responsibilities)
- [3. Technology Stack Overview](#3-technology-stack-overview)
- [4. Data Pipeline Design Overview](#4-data-pipeline-design-overview)
- [5. Feature Breakdown](#5-feature-breakdown)
- [6. API Security Overview](#6-api-security-overview)
- [7. CI/CD Pipeline Overview](#7-cicd-pipeline-overview)
- [8. Project Tasks](#8-project-tasks)
- [9. Resources](#9-resources)
- [10. License](#10-license)
- [11. Created By](#11-created-by)

---

## 1. Project Overview

### 📖 Brief Description

This project is a **practical deep dive into Advanced Shell Scripting**, focusing on automating interactions with a RESTful API (the Pokémon API). It progresses from simple, single API calls to complex operations involving **parallel processing**, **robust error handling**, and **data summarization**. The goal is to simulate real-world **DevOps** and **Data Engineering** tasks where automation, reliability, and efficiency are paramount.

By building a complete data pipeline using only shell tools, you'll gain hands-on experience with the same patterns used in production ETL (Extract, Transform, Load) workflows at leading tech companies.

### 🎯 Project Goals

- **Master API Interaction**: Make HTTP requests from the command line using `curl` with proper error handling
- **JSON Data Manipulation**: Parse, filter, and extract data from JSON responses using `jq`
- **Text Processing Excellence**: Utilize the UNIX text processing trifecta (`grep`, `sed`, `awk`) to transform data
- **Robust Automation**: Implement error handling, status checking, and retry logic for reliable scripts
- **Parallel Processing**: Use shell job control (`&`, `wait`, `$!`) to run tasks concurrently
- **Data Reporting**: Aggregate data from multiple sources and generate structured reports (CSV)
- **Modular Design**: Structure scripts for maintainability and adaptability

### 🔧 Key Tech Stack

| Technology | Purpose |
|------------|---------|
| **Bash** | Shell scripting and automation |
| **cURL** | HTTP request handling |
| **jq** | JSON parsing and manipulation |
| **awk/sed/grep** | Text processing and transformation |
| **PokéAPI** | RESTful data source |

---

## 2. Team Roles and Responsibilities

| Role | Key Responsibility |
|------|-------------------|
| **DevOps Engineer** | Design and implement automation scripts, handle process management, optimize parallel execution |
| **Data Engineer** | Build ETL pipelines, transform JSON data, generate reports and analytics |
| **QA Engineer** | Test scripts for edge cases, validate error handling, ensure data accuracy |
| **Backend Developer** | API integration, retry logic implementation, rate limiting compliance |
| **Technical Writer** | Document script usage, create README files, maintain code comments |

---

## 3. Technology Stack Overview

| Technology | Purpose in the Project |
|------------|----------------------|
| **Bash 5.0+** | Primary scripting language for automation; provides variables, loops, conditionals, functions, and process control |
| **cURL** | Makes HTTP GET requests to the Pokémon API; handles network operations and response capturing |
| **jq** | Lightweight JSON processor; extracts specific fields, filters data, and formats output |
| **awk** | Pattern scanning and text processing; generates reports, calculates averages, and formats tabular data |
| **sed** | Stream editor for text transformation; performs substitutions and text manipulations |
| **grep** | Pattern matching and filtering; searches for specific content in API responses |
| **PokéAPI v2** | RESTful data source providing Pokémon data; free, no authentication required |
| **GNU Coreutils** | Essential utilities (`echo`, `cut`, `sleep`, `wait`) for script operations |
| **Process Control** | Background jobs (`&`), job waiting (`wait`), and PID tracking (`$!`) for parallelism |

---

## 4. Data Pipeline Design Overview

### 🔄 Pipeline Architecture

This project implements a complete **ETL (Extract, Transform, Load)** pipeline:

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   EXTRACTION    │ ──▶ │ TRANSFORMATION  │ ──▶ │    LOADING      │ ──▶ │   REPORTING     │
│   (API Calls)   │     │  (JSON Parsing) │     │  (File Storage) │     │  (CSV/Summary)  │
└─────────────────┘     └─────────────────┘     └─────────────────┘     └─────────────────┘
      curl                    jq                   .json files            awk/sed
```

### 📁 Key Data Entities

| Entity | Description | Source |
|--------|-------------|--------|
| **Pokémon** | Individual Pokémon data including name, stats, types | `https://pokeapi.co/api/v2/pokemon/{name}` |
| **Abilities** | Special abilities each Pokémon possesses | Nested in Pokémon response |
| **Types** | Elemental types (Electric, Fire, Water, etc.) | Nested in Pokémon response |
| **Stats** | Height, weight, base experience | Extracted fields |

### 🔗 Data Relationships

- **One Pokémon → Many Abilities**: Each Pokémon has multiple abilities (regular and hidden)
- **One Pokémon → Multiple Types**: Pokémon can have one or two elemental types
- **Many Pokémon → One Report**: Multiple Pokémon data aggregated into summary CSV

### 📊 Output Files

| File | Format | Content |
|------|--------|---------|
| `data.json` | JSON | Raw Pikachu API response |
| `pokemon_data/{name}.json` | JSON | Individual Pokémon data files |
| `pokemon_report.csv` | CSV | Aggregated name, height, weight data |
| `errors.txt` | Plain text | Error logs for failed requests |

---

## 5. Feature Breakdown

### ⚡ Core Features

- **🔌 Single API Request Automation**
  - Fetch data for a specific Pokémon (Pikachu) and save to JSON
  - Implement error logging for failed requests
  
- **📊 Data Extraction & Formatting**
  - Parse JSON to extract name, height, weight, and type
  - Format output in human-readable sentences using `jq`, `awk`, and `sed`

- **🔄 Batch Data Retrieval**
  - Loop through a list of Pokémon and fetch data for each
  - Save each response to a separate named JSON file
  - Handle rate limiting with configurable delays

- **📈 Data Summarization & Reporting**
  - Read multiple JSON files and extract key metrics
  - Generate CSV reports with formatted data
  - Calculate averages using `awk`

- **🛡️ Error Handling & Retry Logic**
  - Detect failed API requests via HTTP status codes
  - Implement exponential backoff retry mechanism (up to 3 attempts)
  - Log errors and continue processing remaining items

- **🚀 Parallel Data Fetching**
  - Fetch multiple Pokémon simultaneously using background processes
  - Manage concurrent jobs with `wait` and `$!`
  - Ensure all processes complete before generating reports

---

## 6. API Security Overview

| Security Measure | Description | Importance |
|-----------------|-------------|------------|
| **Rate Limiting Compliance** | Implement delays between requests to respect API limits | Prevents IP blocking and ensures fair usage of public APIs |
| **Error Status Validation** | Check HTTP status codes (200, 404, 500) before processing | Prevents processing invalid data and aids in debugging |
| **Input Validation** | Sanitize Pokémon names before API calls | Prevents injection attacks and malformed requests |
| **Retry Backoff** | Exponential delay between retry attempts | Avoids overwhelming the API during transient failures |
| **Secure Output Handling** | Validate JSON before saving to files | Ensures data integrity and prevents corrupted files |
| **HTTPS Enforcement** | Use HTTPS endpoints for all API calls | Encrypts data in transit and prevents MITM attacks |

---

## 7. CI/CD Pipeline Overview

### 🔄 What is CI/CD?

**Continuous Integration/Continuous Deployment (CI/CD)** automates the testing and deployment of shell scripts, ensuring code quality and reliability with every change.

### 🛠️ Pipeline Strategy for Shell Scripts

For this project, a CI/CD pipeline would:

1. **Lint Shell Scripts**: Use `shellcheck` to catch common errors and enforce best practices
2. **Unit Testing**: Run scripts with test data and validate outputs
3. **Integration Testing**: Execute full pipeline and verify API connectivity
4. **Documentation Generation**: Auto-generate usage docs from script comments

### 🔧 Recommended Tools

| Tool | Purpose |
|------|---------|
| **GitHub Actions** | Automated workflow execution on push/PR |
| **ShellCheck** | Static analysis for shell scripts |
| **BATS** | Bash Automated Testing System for unit tests |
| **Docker** | Containerized testing environment |

### 📝 Example GitHub Actions Workflow

```yaml
name: Shell Script CI
on: [push, pull_request]
jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Run ShellCheck
        uses: ludeeus/action-shellcheck@master
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Install dependencies
        run: sudo apt-get install -y jq curl
      - name: Run tests
        run: ./run_tests.sh
```

---

## 8. Project Tasks

### 📋 Task 0: API Request Automation

**Objective**: Automate the process of making API requests and saving results

**Requirements**:
- Fetch data for Pikachu from PokéAPI
- Save response to `data.json`
- Log errors to `errors.txt` on failure

**File**: `apiAutomation-0x00`

```bash
# Sample Output
$ jq . < data.json | head -n 20
{
  "abilities": [
    {
      "ability": {
        "name": "static",
        "url": "https://pokeapi.co/api/v2/ability/9/"
      },
      "is_hidden": false,
      "slot": 1
    }
  ],
  "base_experience": 112,
  ...
}
```

---

### 📋 Task 1: Extract Pokémon Data

**Objective**: Use `jq`, `awk`, and `sed` to extract and format data

**Requirements**:
- Extract name, height, weight, and type from `data.json`
- Format as: `"Pikachu is of type Electric, weighs 6kg, and is 0.4m tall."`
- Use only `jq`, `awk`, and `sed`

**File**: `data_extraction_automation-0x01`

```bash
# Sample Output
$ ./parse_pikachu
Pikachu is of type Electric, weighs 6kg, and is 0.4m tall.
```

---

### 📋 Task 2: Batch Pokémon Data Retrieval

**Objective**: Automate retrieval of data for multiple Pokémon

**Requirements**:
- Loop through: Bulbasaur, Ivysaur, Venusaur, Charmander, Charmeleon
- Save each to `pokemon_data/{name}.json`
- Add delay between requests for rate limiting

**File**: `batchProcessing-0x02`

```bash
# Sample Output
$ ./fetch_multiple_pokemon
Fetching data for bulbasaur...
Saved data to pokemon_data/bulbasaur.json ✅
Fetching data for ivysaur...
Saved data to pokemon_data/ivysaur.json ✅
...
```

---

### 📋 Task 3: Summarize Pokémon Data

**Objective**: Create a summary report from multiple JSON files

**Requirements**:
- Read all JSON files from Task 2
- Extract name, height, weight
- Generate `pokemon_report.csv`
- Calculate average height and weight using `awk`

**File**: `summaryData-0x03`

```bash
# Sample Output
$ ./pokemon_report
CSV Report generated at: pokemon_report.csv

Name,Height (m),Weight (kg)
Bulbasaur,0.7,6.9
Charmander,0.6,8.5
Charmeleon,1.1,19.0
Ivysaur,1.0,13.0
Venusaur,2.0,100.0

Average Height: 1.08 m
Average Weight: 29.48 kg
```

---

### 📋 Task 4: Error Handling and Retry Logic

**Objective**: Add robust error handling to batch processing

**Requirements**:
- Handle network errors and invalid Pokémon names
- Retry failed requests up to 3 times
- Log errors and skip to next Pokémon on permanent failure

**File**: `batchProcessing-0x02` (enhanced)

---

### 📋 Task 5: Parallel Data Fetching

**Objective**: Speed up data retrieval using parallel processing

**Requirements**:
- Fetch Pokémon data in parallel using background processes
- Use `&`, `wait`, and `$!` for process management
- Ensure all processes complete before proceeding

**File**: `batchProcessing-0x04`

---

## 🚀 Quick Start

### Prerequisites

```bash
# Check required tools
bash --version   # Bash 5.0+
curl --version   # cURL 7.0+
jq --version     # jq 1.6+
```

### Installation

```bash
# Clone the repository
git clone https://github.com/MachariaP/ProDev-Backend.git
cd ProDev-Backend/Advanced_shell

# Make scripts executable
chmod +x apiAutomation-0x00
chmod +x data_extraction_automation-0x01
chmod +x batchProcessing-0x02
chmod +x summaryData-0x03
chmod +x batchProcessing-0x04

# Run your first script
./apiAutomation-0x00
```

---

## 📚 Learning Objectives

By completing this project, you will master:

| Skill | Description |
|-------|-------------|
| **API Interaction** | Making HTTP requests with `curl`, handling responses and errors |
| **JSON Manipulation** | Parsing complex nested JSON with `jq` queries |
| **Text Processing** | Using `grep`, `sed`, `awk` for data transformation |
| **Robust Scripting** | Error handling, status checking, retry mechanisms |
| **Process Management** | Background jobs, parallel execution, synchronization |
| **Data Reporting** | CSV generation, statistical calculations |
| **Modular Design** | Writing maintainable, reusable scripts |

---

## 🌍 Real-World Use Case

This project mirrors common patterns in **cloud and data engineering**:

### ETL Pipeline Example

A Data Engineer needs to build a pipeline to collect data from external SaaS platforms (Salesforce, Shopify, Twitter API):

| Phase | Project Task | Real-World Equivalent |
|-------|-------------|----------------------|
| **Extraction** | Tasks 0, 2, 4, 5 | Pulling data from multiple API endpoints |
| **Transformation** | Tasks 1, 3 | Cleaning and formatting raw data |
| **Loading** | JSON/CSV output | Storing data for BI tools |

The skills practiced here are **directly applicable** to building production ETL pipelines!

---

## 📝 Key Concepts

### HTTP Status Codes

| Code | Meaning | Action |
|------|---------|--------|
| `200` | OK - Success | Process response |
| `404` | Not Found | Log error, skip item |
| `429` | Too Many Requests | Implement backoff |
| `500` | Server Error | Retry with delay |

### Idempotency and Retries

Design operations to be safely retried:
- Same input produces same output
- No side effects on repeated execution
- Exponential backoff between retries

### Rate Limiting

Respect API constraints:
- Add delays between requests (`sleep`)
- Monitor for 429 responses
- Implement circuit breaker patterns

### Concurrency vs. Parallelism

- **Concurrency**: Managing multiple tasks (may not run simultaneously)
- **Parallelism**: Actual simultaneous execution using background processes

---

## 9. Resources

### 📖 Documentation

- [PokéAPI Documentation](https://pokeapi.co/docs/v2)
- [jq Manual](https://stedolan.github.io/jq/manual/)
- [Bash Reference Manual](https://www.gnu.org/software/bash/manual/)
- [cURL Documentation](https://curl.se/docs/)
- [AWK Programming Language](https://www.gnu.org/software/gawk/manual/)

### 🎓 Tutorials

- [Advanced Bash-Scripting Guide](https://tldp.org/LDP/abs/html/)
- [ShellCheck Wiki](https://github.com/koalaman/shellcheck/wiki)
- [JSON Processing with jq](https://earthly.dev/blog/jq-select/)

### 🛠️ Tools

- [ShellCheck - Shell Script Linter](https://www.shellcheck.net/)
- [explainshell.com](https://explainshell.com/)
- [BATS Testing Framework](https://github.com/bats-core/bats-core)

---

## 10. License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

```
MIT License

Copyright (c) 2024 Phinehas Macharia

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.
```

---

## 11. Created By

<div align="center">

### 👨‍💻 Phinehas Macharia

[![GitHub](https://img.shields.io/badge/GitHub-@MachariaP-181717?style=for-the-badge&logo=github)](https://github.com/MachariaP)
[![Twitter](https://img.shields.io/badge/Twitter-@_M_Phinehas-1DA1F2?style=for-the-badge&logo=twitter&logoColor=white)](https://twitter.com/_M_Phinehas)

*Building robust automation solutions, one script at a time* 🚀

</div>

---

<div align="center">

## ⭐ Star this repository if you found it helpful!

**Built with ❤️ for developers who want to master shell scripting**

*Last Updated*: December 2024 | *Version*: 1.0 | *Status*: ✅ Actively Maintained

</div>
