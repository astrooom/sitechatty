from langchain_core.prompts import PromptTemplate
from langchain_openai import ChatOpenAI
import json
import re

LANDING_QUESTION_TEMPLATE =  """Generate 3 clear and concise questions and answers related to the context below. Output the questions and answers like the example.

Example: 

1. Q: [Question 1]?
   A: [Answer 1]

2. Q: [Question 2]?
   A: [Answer 2]

3. Q: [Question 3]?
   A: [Answer 3]


Context: {contents}
"""

def get_landing_questions(contents: str):
    llm = ChatOpenAI(model="gpt-4o-mini")
    
    # Create and format the prompt
    prompt_template = PromptTemplate.from_template(LANDING_QUESTION_TEMPLATE)
    prompt = prompt_template.format(contents=contents)
    
    # Get the output from the LLM
    output = llm.invoke(prompt).content
    
    # Define a regular expression to match the questions and answers
    # This regex assumes the format will be: 1. Q: ...? A: ... 2. Q: ...? A: ...
    pattern = re.compile(r'\d+\.\s+Q:\s*(.*?)\?\s*A:\s*(.*?)(?=\s*\d+\.\s+Q:|$)', re.DOTALL)
    
    # Find all matches
    matches = pattern.findall(output)
    
    # Format the matches into a dictionary
    questions = {"questions": []}
    for match in matches:
        question, answer = match
        questions["questions"].append({
            "question": question.strip(),
            "answer": answer.strip()
        })
        
    return questions