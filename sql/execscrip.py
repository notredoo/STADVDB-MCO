import pandas as pd

# The tool will automatically call this function.
# The data from the 'inp' port is passed into the 'data' parameter.
def rm_main(data):
    # 'data' is the input DataFrame.
    # The raw JSON text is in the first cell (row 0, column 0).
    json_text = data.iloc[0, 0]

    # Convert the JSON text into a new, clean table.
    clean_table = pd.read_json(json_text)

    # Return the clean table. This is what gets sent to the 'out' port.
    return clean_table