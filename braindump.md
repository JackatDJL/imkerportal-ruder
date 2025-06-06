denke gerade dass ich die einträge bei actions performed in der db bei colony_inspections durch api setzen möchte und dass die func automatisch dann auch die hive_boxes anpasst. dann ist das transaction und typesafe
aber noch nen ding ist dass ich dann ein edit, save, cancel system in der ui machen muss

## functions
- colonies
    - list colonies
    - get colony
    - add colony
    - change colony chunk
    - change identifier // redirect
    
    ```this is for cmdk interface```
    - change location
    - change hivetype
    - change (queen) origin
    - change (queen) birthyear
    - change (queen) marker
    - change (queen) traits // 2type e.g. either all entries (dis an object) or single trait
    - change strength
    - dissolve colony

- inspections
    - list inspections
    - list inspections by colony
    - get inspection
    - add inspection
    - change inspection chunk
    - 