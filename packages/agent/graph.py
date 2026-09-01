import operator
from typing import Annotated, Sequence, TypedDict, List
from langchain_core.messages import BaseMessage, HumanMessage, AIMessage
from langgraph.graph import StateGraph, END
from langchain_community.llms import Ollama
from packages.rag.client import LocalRAG

# The state dictionary for the graph
class AgentState(TypedDict):
    messages: Annotated[Sequence[BaseMessage], operator.add]
    retrieved_docs: List[dict]
    planned_action: str
    safety_passed: bool
    final_response: str

class CompanionAgent:
    def __init__(self, ollama_url: str = "http://localhost:11434", model: str = "qwen2.5:3b"):
        self.llm = Ollama(base_url=ollama_url, model=model, temperature=0.7)
        self.rag = LocalRAG()
        self.graph = self._build_graph()

    def _build_graph(self):
        workflow = StateGraph(AgentState)
        
        # Define nodes
        workflow.add_node("validate_input", self.validate_input)
        workflow.add_node("retrieve", self.retrieve_docs)
        workflow.add_node("plan", self.plan_response)
        workflow.add_node("generate", self.generate_response)
        workflow.add_node("safety_check", self.safety_check)
        
        # Define edges
        workflow.set_entry_point("validate_input")
        workflow.add_edge("validate_input", "retrieve")
        workflow.add_edge("retrieve", "plan")
        workflow.add_edge("plan", "generate")
        workflow.add_edge("generate", "safety_check")
        workflow.add_edge("safety_check", END)
        
        return workflow.compile()

    def validate_input(self, state: AgentState):
        """Input validation: Filter out obviously unsafe or invalid inputs."""
        return {"messages": state["messages"]}

    def retrieve_docs(self, state: AgentState):
        """Optional RAG retrieval."""
        last_msg = state["messages"][-1].content
        docs = self.rag.retrieve(last_msg)
        return {"retrieved_docs": docs}

    def plan_response(self, state: AgentState):
        """Response planning: Determine intent (chat, physical_command, memory)."""
        return {"planned_action": "chat"} # Simplified for prototype

    def generate_response(self, state: AgentState):
        """Generate response citing sources."""
        last_msg = state["messages"][-1].content
        docs = state.get("retrieved_docs", [])
        
        context = ""
        if docs:
            context = "Local Information Context:\n"
            for d in docs:
                context += f"Source Title: {d['title']}\nContent: {d['content']}\n---\n"
                
        prompt = f"""You are a helpful, local, privacy-first companion bot. 
You cannot control hardware directly. If asked to move or do physical tasks, politely explain you can't do that yet.
If using context, you MUST cite the source title.

{context}
User: {last_msg}
Companion:"""
        
        try:
            response = self.llm.invoke(prompt)
        except Exception:
            response = "I'm having trouble connecting to my local language model."
            
        return {"final_response": response}

    def safety_check(self, state: AgentState):
        """Response safety check."""
        resp = state.get("final_response", "")
        # Basic deterministic check ensuring LLM doesn't output dangerous commands
        if "SYS_EXEC" in resp or "sudo" in resp:
            return {"safety_passed": False, "final_response": "I cannot provide that response due to safety constraints."}
        return {"safety_passed": True, "final_response": resp}

    def chat(self, user_text: str) -> str:
        state = {"messages": [HumanMessage(content=user_text)]}
        result = self.graph.invoke(state)
        return result["final_response"]
