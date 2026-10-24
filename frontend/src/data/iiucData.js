export const IIUC_FACULTIES = [
  {
    id: "shariah",
    name: "Faculty of Shariah and Islamic Studies",
    departments: [
      "Qur'anic Sciences and Islamic Studies",
      "Da'wah and Islamic Studies",
      "Science of Hadith and Islamic Studies"
    ]
  },
  {
    id: "engineering",
    name: "Faculty of Science and Engineering",
    departments: [
      "Computer Science and Engineering",
      "Computer and Communication Engineering",
      "Electrical and Electronic Engineering",
      "Electronic and Telecommunication Engineering",
      "Civil Engineering",
      "Pharmacy"
    ]
  },
  {
    id: "business",
    name: "Faculty of Business Studies",
    departments: [
      "Business Administration",
      "Department of Finance"
    ]
  },
  {
    id: "arts",
    name: "Faculty of Arts and Humanities",
    departments: [
      "English Language and Literature",
      "Arabic Language and Literature",
      "Library and Information Science"
    ]
  },
  {
    id: "law",
    name: "Faculty of Law",
    departments: [
      "Department of Law"
    ]
  },
  {
    id: "social_science",
    name: "Faculty of Social Science",
    departments: [
      "Economics & Banking"
    ]
  },
  {
    id: "center",
    name: "Center and Institute",
    departments: [
      "Center for General Education"
    ]
  }
];

export const SEMESTERS = [
  "1st Semester", "2nd Semester", "3rd Semester", "4th Semester",
  "5th Semester", "6th Semester", "7th Semester", "8th Semester"
];

export const DEFAULT_GRADING_SCALE = {
  "A+": 4.00,
  "A": 3.75,
  "A-": 3.50,
  "B+": 3.25,
  "B": 3.00,
  "B-": 2.75,
  "C+": 2.50,
  "C": 2.25,
  "D": 2.00,
  "F": 0.00
};

export const SAMPLE_LECTURE_NOTES = {
  os: {
    title: "Operating Systems — Virtual Memory & Demand Paging",
    course: "CSE 3515 - Operating Systems",
    faculty: "Faculty of Science and Engineering",
    department: "Computer Science and Engineering",
    text: `Operating Systems Lecture 9: Virtual Memory and Demand Paging

1. Concept of Virtual Memory:
Virtual memory separates user logical memory from physical memory. This allows an extremely large virtual memory to be provided for programmers when only a smaller physical memory (RAM) is available. Only part of the program needs to be in memory for execution, which increases degree of multiprogramming and CPU utilization.

2. Demand Paging:
Pages are loaded only on demand (when requested during execution), never when they are not accessed. 
- A page table with valid-invalid bits is maintained.
- Valid (v) means page is in physical RAM (frame assigned).
- Invalid (i) means page is not in memory (page fault occurs).

3. Page Fault Handling Steps:
Step 1: CPU tries to access a memory location. If the page table entry indicates invalid, a Page Fault trap occurs.
Step 2: Operating system traps to kernel mode.
Step 3: OS checks internal table to ensure the memory reference is valid and legal.
Step 4: A free physical frame is located in memory.
Step 5: OS schedules a disk read to fetch the missing page into the allocated frame.
Step 6: When disk I/O completes, internal table and page table are updated (bit set to valid).
Step 7: The interrupted instruction is restarted.

4. Page Replacement Algorithms:
- FIFO (First-In, First-Out): Suffers from Belady's Anomaly where allocating more frames can result in more page faults!
- Optimal Algorithm: Replaces the page that will not be used for the longest period of future time. (Benchmark, cannot be implemented in real-time).
- LRU (Least Recently Used): Replaces the page that has not been used for the longest period in the past. Implemented via counters or a stack.
- Thrashing: When a system spends more time paging than executing instructions because the sum of working set sizes exceeds total physical memory.`
  },
  db: {
    title: "Database Systems — Normalization & Functional Dependencies",
    course: "CSE 3521 - Database Systems",
    faculty: "Faculty of Science and Engineering",
    department: "Computer Science and Engineering",
    text: `Database Systems Lecture 14: Relational Database Normalization

1. Purpose of Normalization:
Normalization is the process of organizing data in a database to reduce data redundancy and eliminate anomalies during insertion, deletion, and updates.

2. Normal Forms:
- First Normal Form (1NF): Each column must contain atomic (indivisible) values, and each record must be unique. No repeating groups or arrays.
- Second Normal Form (2NF): Must be in 1NF and have NO partial dependencies (every non-prime attribute must be fully functionally dependent on the entire primary key, not a subset).
- Third Normal Form (3NF): Must be in 2NF and have NO transitive dependencies (non-prime attributes must not determine other non-prime attributes: X -> Y where neither is a candidate key).
- Boyce-Codd Normal Form (BCNF): A stricter version of 3NF where for every functional dependency X -> Y, X must be a super key.

3. Lossless Join & Dependency Preservation:
A decomposition is lossless if joining the decomposed relations produces the exact original relation without spurious tuples. Dependency preservation ensures all original functional dependencies can be checked without performing costly joins.`
  },
  shariah: {
    title: "Principles of Islamic Jurisprudence — Usul al-Fiqh",
    course: "QSIS 1101 - Principles of Qur'anic Exegesis",
    faculty: "Faculty of Shariah and Islamic Studies",
    department: "Qur'anic Sciences and Islamic Studies",
    text: `Principles of Islamic Jurisprudence (Usul al-Fiqh) Lecture:

1. Primary Sources of Shariah:
- The Holy Qur'an: The verbatim word of Allah revealed to Prophet Muhammad (peace be upon him). Definite in transmission (Qat'i al-Thubut).
- The Sunnah: Sayings, actions, and approvals of the Messenger. Categorized into Mutawatir (continuous) and Ahad (solitary).

2. Secondary Evidences:
- Ijma' (Consensus): The unanimous agreement of qualified Muslim jurists (Mujtahideen) in a given generation on a legal ruling after the demise of the Prophet.
- Qiyas (Analogical Reasoning): Deriving a ruling for a novel case from an established case sharing the identical underlying effective cause ('Illah).
Components of Qiyas: Asl (original case), Far' (new case), Hukm (original ruling), 'Illah (effective ratio).

3. Educational Note:
In academic study at IIUC, juristic analysis explores classical methods and schools (Madhahib) while encouraging students to consult authoritative classical commentaries.`
  }
};
