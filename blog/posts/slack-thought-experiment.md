# slack thought experiment

recently i ran into an interesting edge case while experimenting with the API of Slack. this post is not about an exploit. i reported the behavior to Slack and they categorized it as N/A.

i use Slack's free tier within some of my organizations. this limits the amount of message history visible in a workspace. this limit is a product restriction, the data still exists in Slack's infrastructure, it is just hidden from the UI once the workspace exceeds the history cap. you can regain access to this data by paying for it.

Slack's platform has accumulated a rich set of APIs over time. for example message history endpoints, thread retrieval, search APIs, conversation metadata and so on, and so on... so how do you enforce product limits consistently when your API surface keeps growing like that?

## my observation

while working with threaded conversations, i noticed that threads represent a context expansion around a message. instead of requesting a time ordered slice of history, you are asking the system "give me everything related to this specific message". this is a different query model than "give me the last N messages". if a system enforces historical limits primarily in the timeline query, then context based retrieval paths like threads might behave differently.

to be clear, i am not publishing any reproduction details here. this is simply a hypothetical scenario in software architecture.

imagine a messaging platform where timeline queries enforce history limits, while thread retrieval returns the entire thread context. now imagine that older messages still exist internally.

a determined client could theoretically try to reconstruct portions of hidden history indirectly through contextual relationships. importantly, we are not breaking authentication here, we are simply navigating the graph of message relationships. this is not unique to messaging systems, of course. any data model that contains links between objects can potentially expose older nodes through contextual traversal.

timeline queries operate like a window,
```
[ visible messages ]
--------------------
[ hidden history   ]
```

contextual queries, on the other hand, operate more like a graph traversal
```
msg A
│
├── reply
│
msg B
│
├── reply
│
msg C
```

if some nodes are hidden by timeline policy but still connected in the graph, the traversal rules become interesting. if there is something to learn from this, it might be that product policies are often layered on top of systems that were not originally designed with those constraints in mind.

if you were designing this system from scratch today, you might want to enforce historical limits at the data access layer. every API endpoint would then rely on the same policy filter. this is of course easy to say in theory and much harder in a system that has evolved over a a decade.

this is not a major issue, since messages could be saved manually anyway. but one might wonder what could happen if someone did this programmatically and presented it in a polished way through the UI, for example, as a plugin.

:o)
