from scrapegraphai.graphs import SmartScraperGraph

graph_config = {
    "llm": {
        "model": "ollama/phi3",
        "temperature": 0,
        "format": "json",  # Ollama needs the format to be specified explicitly
        "base_url": "http://ollama:11434",  # set Ollama URL
    },
    "embeddings": {
        "model": "ollama/nomic-embed-text",
        "base_url": "http://ollama:11434",  # set Ollama URL
    },
    "verbose": True,
}

smart_scraper_graph = SmartScraperGraph(
    prompt="Which plans are available?",
    # also accepts a string with the already downloaded HTML code
    source="https://ultraservers.com",
    config=graph_config
)

result = smart_scraper_graph.run()
print(result)