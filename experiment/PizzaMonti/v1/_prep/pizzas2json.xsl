<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">

    <xsl:output method="text"/>

    <xsl:template match="/pizzas">
{
    "pizzas" : [
        <xsl:for-each select="article">
        {
            "name" : "<xsl:value-of select="div/p[@class='produit']"/>",
            "ingredients" : "<xsl:value-of select="div/p[@class='desig']"/>",
            "price" : {
                "small" : "<xsl:value-of select="div/p[@class='prix1']"/>",
                "big" : "<xsl:value-of select="div/p[@class='prix2']"/>"
            }
        },
        </xsl:for-each>
    ],
    "ingredients" : "<xsl:for-each select="article/div/p[@class='desig']"><xsl:value-of select="."/>, </xsl:for-each>"
}
    </xsl:template>

</xsl:stylesheet>