**Problem Statement: AI-Driven Course Recommendation System for TUM Informatics Master Students**  

**Problem Description:** 
Master students in TUM Informatics face challenges selecting suitable courses due to:  
1. *Overwhelming options*: 100+ modules across specializations (e.g., AI, Robotics, Software Engineering).  
2. *Lack of peer insights*: Difficulty gauging course relevance to interests or workload.  
3. *Handbook complexity*: Module descriptions are often too technical or vague to parse efficiently.  

Current solutions (e.g., Excel sheets, word-of-mouth) lack personalization and data-driven recommendations.  

**Proposed Solution**  
A web-based tool that:  
1. *Collects user data*:  
   - Login system (TUM-ID/OAuth) to track individual progress.  
   - Interface to input taken courses (type: seminar/practical/lecture) and rate them (1–5 stars/add feedback).  
2. *Analyzes preferences*:  
   - Database of historical data (courses + ratings from past students).  
   - LLM (e.g., GPT-4) to parse module handbooks using RAG (Retrieval-Augmented Generation), extracting keywords (e.g., "machine learning", "embedded systems").  
3. *Generates recommendations*:  
   - Hybrid filtering: Combines collaborative filtering (peer ratings) and content-based filtering (LLM analysis) to balance popularity and personal relevance.  
   - Suggests courses matching interests and TUM curriculum rules.  

**Key Components**  
- *Frontend*: Angular/React for course input/ratings + recommendation display.  
- *Backend*: Java Spring API handling user data.  
- *Database*: MySQL with tables for user profiles, course metadata, and ratings.  
- *LLM Integration*: RAG pipeline over TUM module PDFs (LangChain/Unstructured.io).  

**Anticipated Benefits**  
- Reduce time spent on course selection.  
- Increase student satisfaction via personalized, peer-validated suggestions.  
- Improve adherence to TUM’s curriculum requirements.
