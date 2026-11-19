CC = gcc
CFLAGS = -Wall -Wextra -O2
TARGET = stockverse.cgi

SRCS = stockverse.c cgi_handler.c

all: $(TARGET)

$(TARGET): $(SRCS)
	$(CC) $(CFLAGS) $(SRCS) -o $(TARGET)
	@echo Build complete: $(TARGET)

clean:
	rm -f $(TARGET) stockverse.cgi.exe *.o *.dat *.bin

.PHONY: all clean
